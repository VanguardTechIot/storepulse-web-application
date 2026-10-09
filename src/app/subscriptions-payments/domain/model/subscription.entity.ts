import { BaseEntity } from '../../../shared/domain/model/base-entity';
import { BillingCycle } from './billing-cycle.enum';
import { BillingPeriod, EXPIRING_SOON_DAYS } from './billing-period.value-object';
import { SubscriptionPlan } from './subscription-plan.entity';
import { SubscriptionStatus } from './subscription-status.enum';
import { SubscriptionsError, SubscriptionsErrorCode } from './subscriptions-error';

export interface SubscriptionProps {
  id: string;
  galleryId: string;
  galleryAdministratorId: string;
  planId: string;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  /** `null` while the first payment is pending. */
  billingPeriod: BillingPeriod | null;
  monitoredUnitCount: number;
  autoRenewal: boolean;
  /** Card or account used for the charges, e.g. `Visa •••• 4821`. */
  paymentMethodLabel: string | null;
}

/**
 * Aggregate root: subscription of a commercial gallery. The gallery administrator is the only
 * actor who contracts it; a gallery never has two active subscriptions at the same time.
 */
export class Subscription implements BaseEntity {
  private constructor(private readonly props: SubscriptionProps) {}

  static restore(props: SubscriptionProps): Subscription {
    return new Subscription({ ...props });
  }

  /** RequestSubscriptionCommand: created as pending until the gateway confirms the charge (US-44). */
  static request(props: {
    id: string;
    galleryId: string;
    galleryAdministratorId: string;
    plan: SubscriptionPlan;
    billingCycle: BillingCycle;
    monitoredUnitCount: number;
  }): Subscription {
    if (!props.plan.allowsUnits(props.monitoredUnitCount)) {
      throw new SubscriptionsError(SubscriptionsErrorCode.UnitLimitExceeded);
    }
    return new Subscription({
      id: props.id,
      galleryId: props.galleryId,
      galleryAdministratorId: props.galleryAdministratorId,
      planId: props.plan.id,
      status: SubscriptionStatus.PendingPayment,
      billingCycle: props.billingCycle,
      billingPeriod: null,
      monitoredUnitCount: props.monitoredUnitCount,
      autoRenewal: true,
      paymentMethodLabel: null,
    });
  }

  get id(): string {
    return this.props.id;
  }
  get galleryId(): string {
    return this.props.galleryId;
  }
  get galleryAdministratorId(): string {
    return this.props.galleryAdministratorId;
  }
  get planId(): string {
    return this.props.planId;
  }
  get status(): SubscriptionStatus {
    return this.props.status;
  }
  get billingCycle(): BillingCycle {
    return this.props.billingCycle;
  }
  get billingPeriod(): BillingPeriod | null {
    return this.props.billingPeriod;
  }
  get monitoredUnitCount(): number {
    return this.props.monitoredUnitCount;
  }
  get autoRenewal(): boolean {
    return this.props.autoRenewal;
  }
  get paymentMethodLabel(): string | null {
    return this.props.paymentMethodLabel;
  }

  get isActive(): boolean {
    return this.props.status === SubscriptionStatus.Active;
  }

  get isExpired(): boolean {
    return this.props.status === SubscriptionStatus.Expired;
  }

  /** US-45, scenario 2: active and close to its expiration date. */
  isExpiringSoon(reference: Date = new Date()): boolean {
    const period = this.props.billingPeriod;
    return this.isActive && !!period && period.daysUntilEnd(reference) <= EXPIRING_SOON_DAYS;
  }

  daysUntilExpiration(reference: Date = new Date()): number | null {
    return this.props.billingPeriod?.daysUntilEnd(reference) ?? null;
  }

  /**
   * The gateway accepted the charge (PaymentRegisteredEvent): the subscription becomes active with
   * a new period. Also used to change the plan or to subscribe again after expiring.
   */
  activate(
    plan: SubscriptionPlan,
    cycle: BillingCycle,
    paymentMethodLabel: string,
    at: Date = new Date(),
  ): Subscription {
    if (!plan.allowsUnits(this.props.monitoredUnitCount)) {
      throw new SubscriptionsError(SubscriptionsErrorCode.UnitLimitExceeded);
    }
    return new Subscription({
      ...this.props,
      planId: plan.id,
      status: SubscriptionStatus.Active,
      billingCycle: cycle,
      billingPeriod: BillingPeriod.startingAt(at, cycle),
      autoRenewal: true,
      paymentMethodLabel,
    });
  }

  /** US-46: no future charges; the subscription keeps its validity until the expiration date. */
  cancelRenewal(): Subscription {
    if (!this.isActive) throw new SubscriptionsError(SubscriptionsErrorCode.SubscriptionNotActive);
    if (!this.props.autoRenewal) {
      throw new SubscriptionsError(SubscriptionsErrorCode.RenewalAlreadyDisabled);
    }
    return new Subscription({ ...this.props, autoRenewal: false });
  }

  /** US-47: only while the subscription is still valid; an expired one must be renewed first. */
  reactivateRenewal(): Subscription {
    if (this.isExpired) throw new SubscriptionsError(SubscriptionsErrorCode.SubscriptionExpired);
    if (!this.isActive) throw new SubscriptionsError(SubscriptionsErrorCode.SubscriptionNotActive);
    if (this.props.autoRenewal) {
      throw new SubscriptionsError(SubscriptionsErrorCode.RenewalAlreadyEnabled);
    }
    return new Subscription({ ...this.props, autoRenewal: true });
  }
}
