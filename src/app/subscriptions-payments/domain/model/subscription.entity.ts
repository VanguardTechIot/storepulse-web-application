import { BaseEntity } from '../../../shared/domain/model/base-entity';
import { BillingCycle } from '../enums/billing-cycle.enum';
import { BillingPeriod, EXPIRING_SOON_DAYS } from '../value-objects/billing-period.value-object';
import { SubscriptionStatus } from '../enums/subscription-status.enum';
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
 * actor who contracts it; the platform activates it once the gateway accepts the charge.
 */
export class Subscription implements BaseEntity {
  private constructor(private readonly props: SubscriptionProps) {}

  static restore(props: SubscriptionProps): Subscription {
    return new Subscription({ ...props });
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

  /** Active and close to its expiration date. */
  isExpiringSoon(reference: Date = new Date()): boolean {
    const period = this.props.billingPeriod;
    return this.isActive && !!period && period.daysUntilEnd(reference) <= EXPIRING_SOON_DAYS;
  }

  daysUntilExpiration(reference: Date = new Date()): number | null {
    return this.props.billingPeriod?.daysUntilEnd(reference) ?? null;
  }

  /** No future charges; the subscription keeps its validity until the expiration date. */
  cancelRenewal(): Subscription {
    if (!this.isActive) throw new SubscriptionsError(SubscriptionsErrorCode.SubscriptionNotActive);
    if (!this.props.autoRenewal) {
      throw new SubscriptionsError(SubscriptionsErrorCode.RenewalAlreadyDisabled);
    }
    return new Subscription({ ...this.props, autoRenewal: false });
  }

  /** Only while the subscription is still valid; an expired one must be renewed first. */
  reactivateRenewal(): Subscription {
    if (this.isExpired) throw new SubscriptionsError(SubscriptionsErrorCode.SubscriptionExpired);
    if (!this.isActive) throw new SubscriptionsError(SubscriptionsErrorCode.SubscriptionNotActive);
    if (this.props.autoRenewal) {
      throw new SubscriptionsError(SubscriptionsErrorCode.RenewalAlreadyEnabled);
    }
    return new Subscription({ ...this.props, autoRenewal: true });
  }
}
