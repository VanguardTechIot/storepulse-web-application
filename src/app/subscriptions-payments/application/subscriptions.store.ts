import { computed, inject, Injectable, signal, WritableSignal } from '@angular/core';
import { GalleryReference } from '../domain/model/gallery-reference';
import { Payment } from '../domain/model/payment.entity';
import { PaymentCard } from '../domain/model/payment-card.value-object';
import { RegisterPaymentCommand } from '../domain/model/register-payment.command';
import { RequestSubscriptionCommand } from '../domain/model/request-subscription.command';
import { Subscription } from '../domain/model/subscription.entity';
import { SubscriptionPlan } from '../domain/model/subscription-plan.entity';
import { SubscriptionsError, SubscriptionsErrorCode } from '../domain/model/subscriptions-error';
import { IamContextFacade } from '../infrastructure/acl/iam-context-facade';
import { PropertyContextFacade } from '../infrastructure/acl/property-context-facade';
import { SUBSCRIPTIONS_REPOSITORY } from '../infrastructure/subscriptions.token';

/**
 * Application service of Subscriptions and Payments: coordinates the use cases of the gallery
 * subscription (US-44 to US-47) and keeps its state.
 *
 * Each command resolves to `true` when it succeeds. On failure it resolves to `false` and exposes
 * the reason in `error` (a `SubscriptionsErrorCode`, translated as `subscriptions.errors.<code>`).
 */
@Injectable({ providedIn: 'root' })
export class SubscriptionsStore {
  private readonly repository = inject(SUBSCRIPTIONS_REPOSITORY);
  private readonly iamContext = inject(IamContextFacade);
  private readonly propertyContext = inject(PropertyContextFacade);

  private readonly galleryState = signal<GalleryReference | null>(null);
  private readonly plansState = signal<SubscriptionPlan[]>([]);
  private readonly subscriptionState = signal<Subscription | null>(null);
  private readonly paymentsState = signal<Payment[]>([]);

  readonly gallery = this.galleryState.asReadonly();
  readonly plans = this.plansState.asReadonly();
  readonly subscription = this.subscriptionState.asReadonly();
  readonly payments = this.paymentsState.asReadonly();
  readonly galleryRegistrationRoute = this.propertyContext.galleryRegistrationRoute;

  readonly loading = signal(false);
  readonly processing = signal(false);
  /** True once the data has been loaded at least once. */
  readonly loaded = signal(false);
  readonly error = signal<SubscriptionsErrorCode | null>(null);

  readonly currentPlan = computed(() => {
    const subscription = this.subscriptionState();
    return subscription ? (this.planById(subscription.planId) ?? null) : null;
  });

  readonly monitoredUnitCount = computed(() => this.galleryState()?.monitoredUnitCount ?? 0);

  /** US-45: the renewal is near (or the automatic renewal was turned off and it will expire). */
  readonly isExpiringSoon = computed(() => this.subscriptionState()?.isExpiringSoon() ?? false);

  planById(planId: string): SubscriptionPlan | undefined {
    return this.plansState().find((plan) => plan.id === planId);
  }

  // ---------- Queries ----------
  /** Gallery, plan catalog, subscription and payment history. */
  load(): Promise<boolean> {
    return this.execute(this.loading, async () => {
      const administratorId = this.iamContext.currentAdministratorId();
      if (!administratorId)
        throw new SubscriptionsError(SubscriptionsErrorCode.GalleryNotRegistered);
      const [gallery, plans] = await Promise.all([
        this.propertyContext.getGalleryOf(administratorId),
        this.repository.listPlans(),
      ]);
      this.plansState.set(plans);
      this.galleryState.set(gallery);
      if (!gallery) throw new SubscriptionsError(SubscriptionsErrorCode.GalleryNotRegistered);
      const subscription = await this.repository.findSubscriptionByGallery(gallery.galleryId);
      this.subscriptionState.set(subscription);
      this.paymentsState.set(
        subscription ? await this.repository.listPayments(subscription.id) : [],
      );
      this.loaded.set(true);
    });
  }

  // ---------- Commands ----------
  /**
   * US-44: contracts the plan (or changes to it) and pays it. The subscription is activated only
   * when the gateway accepts the charge; a rejected charge leaves the current state untouched.
   */
  subscribe(command: RequestSubscriptionCommand): Promise<boolean> {
    return this.execute(this.processing, async () => {
      const gallery = this.requireGallery();
      const plan = this.planById(command.planId);
      if (!plan) throw new SubscriptionsError(SubscriptionsErrorCode.PlanNotFound);
      if (!plan.allowsUnits(gallery.monitoredUnitCount)) {
        throw new SubscriptionsError(SubscriptionsErrorCode.UnitLimitExceeded);
      }
      const card = new PaymentCard(command.cardNumber, command.cardExpiry);

      let subscription = this.subscriptionState();
      if (!subscription) {
        subscription = await this.repository.saveSubscription(
          Subscription.request({
            id: crypto.randomUUID(),
            galleryId: gallery.galleryId,
            galleryAdministratorId: this.iamContext.currentAdministratorId() ?? '',
            plan,
            billingCycle: command.billingCycle,
            monitoredUnitCount: gallery.monitoredUnitCount,
          }),
        );
        this.subscriptionState.set(subscription);
      }

      const payment = await this.repository.registerPayment(
        new RegisterPaymentCommand({
          subscriptionId: subscription.id,
          planId: plan.id,
          billingCycle: command.billingCycle,
          amount: plan.priceFor(command.billingCycle),
          method: command.paymentMethod,
          card,
        }),
      );
      this.paymentsState.update((payments) => [payment, ...payments]);
      if (!payment.isAccepted) throw new SubscriptionsError(SubscriptionsErrorCode.PaymentRejected);

      const activated = subscription.activate(plan, command.billingCycle, card.label);
      this.subscriptionState.set(await this.repository.saveSubscription(activated));
    });
  }

  /** US-46: turns off the automatic renewal; the subscription stays valid until it expires. */
  cancelRenewal(): Promise<boolean> {
    return this.execute(this.processing, async () => {
      const updated = this.requireSubscription().cancelRenewal();
      this.subscriptionState.set(await this.repository.saveSubscription(updated));
    });
  }

  /** US-47: turns the automatic renewal back on while the subscription is still valid. */
  reactivateRenewal(): Promise<boolean> {
    return this.execute(this.processing, async () => {
      const updated = this.requireSubscription().reactivateRenewal();
      this.subscriptionState.set(await this.repository.saveSubscription(updated));
    });
  }

  clearError(): void {
    this.error.set(null);
  }

  private requireGallery(): GalleryReference {
    const gallery = this.galleryState();
    if (!gallery) throw new SubscriptionsError(SubscriptionsErrorCode.GalleryNotRegistered);
    return gallery;
  }

  private requireSubscription(): Subscription {
    const subscription = this.subscriptionState();
    if (!subscription) throw new SubscriptionsError(SubscriptionsErrorCode.SubscriptionNotFound);
    return subscription;
  }

  private async execute(
    flag: WritableSignal<boolean>,
    operation: () => Promise<void>,
  ): Promise<boolean> {
    flag.set(true);
    this.error.set(null);
    try {
      await operation();
      return true;
    } catch (error) {
      this.error.set(
        error instanceof SubscriptionsError ? error.code : SubscriptionsErrorCode.Unexpected,
      );
      return false;
    } finally {
      flag.set(false);
    }
  }
}
