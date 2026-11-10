import { computed, inject, Injectable, signal, WritableSignal } from '@angular/core';
import { runCommand } from '../../shared/application/run-command';
import { GalleryReference } from '../domain/model/gallery-reference';
import { Payment } from '../domain/model/payment.entity';
import { PaymentCard } from '../domain/value-objects/payment-card.value-object';
import { RequestSubscriptionCommand } from '../domain/model/request-subscription.command';
import { Subscription } from '../domain/model/subscription.entity';
import { SubscriptionPlan } from '../domain/model/subscription-plan.entity';
import { SubscriptionsError, SubscriptionsErrorCode } from '../domain/model/subscriptions-error';
import { IamContextFacade } from '../infrastructure/acl/iam-context-facade';
import { PropertyContextFacade } from '../infrastructure/acl/property-context-facade';
import { SUBSCRIPTIONS_REPOSITORY } from '../infrastructure/repositories/subscriptions.token';

/**
 * Application service of Subscriptions and Payments: coordinates the use cases of the gallery
 * subscription and keeps its state.
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

  /** The renewal is near, or the automatic renewal was turned off and it will expire. */
  readonly isExpiringSoon = computed(() => this.subscriptionState()?.isExpiringSoon() ?? false);

  planById(planId: string): SubscriptionPlan | undefined {
    return this.plansState().find((plan) => plan.id === planId);
  }

  // ---------- Queries ----------
  /** Gallery, plan catalog, subscription and payment history. */
  load(): Promise<boolean> {
    return this.execute(this.loading, async () => {
      if (!this.iamContext.currentAdministratorId())
        throw new SubscriptionsError(SubscriptionsErrorCode.GalleryNotRegistered);
      const [gallery, plans] = await Promise.all([
        this.propertyContext.getGallery(),
        this.repository.listPlans(),
      ]);
      this.plansState.set(plans);
      this.galleryState.set(gallery);
      if (!gallery) throw new SubscriptionsError(SubscriptionsErrorCode.GalleryNotRegistered);
      await this.reloadSubscription(gallery.galleryId);
      this.loaded.set(true);
    });
  }

  // ---------- Commands ----------
  /**
   * Contracts the plan (or changes to it) and pays it. The platform activates the subscription
   * only when the gateway accepts the charge; a rejected charge is still recorded in the history.
   */
  subscribe(command: RequestSubscriptionCommand): Promise<boolean> {
    return this.execute(this.processing, async () => {
      const gallery = this.requireGallery();
      const plan = this.planById(command.planId);
      if (!plan) throw new SubscriptionsError(SubscriptionsErrorCode.PlanNotFound);
      if (!plan.allowsUnits(gallery.monitoredUnitCount)) {
        throw new SubscriptionsError(SubscriptionsErrorCode.UnitLimitExceeded);
      }
      // Validates the card before it leaves the browser.
      new PaymentCard(command.cardNumber, command.cardExpiry);
      try {
        const subscription = await this.repository.requestSubscription(gallery, command);
        this.subscriptionState.set(subscription);
        this.paymentsState.set(await this.repository.listPayments(subscription.id));
      } catch (error) {
        if (
          error instanceof SubscriptionsError &&
          error.code === SubscriptionsErrorCode.PaymentRejected
        ) {
          await this.reloadSubscription(gallery.galleryId);
        }
        throw error;
      }
    });
  }

  /** Turns off the automatic renewal; the subscription stays valid until it expires. */
  cancelRenewal(): Promise<boolean> {
    return this.execute(this.processing, async () => {
      const subscription = this.requireSubscription();
      subscription.cancelRenewal();
      this.subscriptionState.set(await this.repository.cancelRenewal(subscription.id));
    });
  }

  /** Turns the automatic renewal back on while the subscription is still valid. */
  reactivateRenewal(): Promise<boolean> {
    return this.execute(this.processing, async () => {
      const subscription = this.requireSubscription();
      subscription.reactivateRenewal();
      this.subscriptionState.set(await this.repository.reactivateRenewal(subscription.id));
    });
  }

  clearError(): void {
    this.error.set(null);
  }

  private async reloadSubscription(galleryId: string): Promise<void> {
    const subscription = await this.repository.findSubscriptionByGallery(galleryId);
    this.subscriptionState.set(subscription);
    this.paymentsState.set(subscription ? await this.repository.listPayments(subscription.id) : []);
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
    busy: WritableSignal<boolean>,
    command: () => Promise<void>,
  ): Promise<boolean> {
    const toCode = (failure: unknown) =>
      failure instanceof SubscriptionsError ? failure.code : SubscriptionsErrorCode.Unexpected;
    return (await runCommand(busy, this.error, toCode, command)) !== null;
  }
}
