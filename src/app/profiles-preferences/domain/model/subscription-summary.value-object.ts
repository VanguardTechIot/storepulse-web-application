import { SubscriptionPlan } from './subscription-plan.enum';
import { SubscriptionStatus } from './subscription-status.enum';

/**
 * Subscription of the gallery as the profile shows it (US-45): plan, status and expiration date.
 * It belongs to Subscriptions and Payments; this context only reads it.
 */
export class SubscriptionSummary {
  /** Subscription plan. */
  readonly plan: SubscriptionPlan;
  /** Current subscription status. */
  readonly status: SubscriptionStatus;
  /** Date on which the subscription expires. */
  readonly expiresAt: Date;
  /** Whether the subscription renews automatically. */
  readonly autoRenewal: boolean;

  /**
   * Creates a read-only summary of a gallery subscription.
   *
   * @param summary - Subscription plan, status, expiration date, and renewal setting.
   */
  constructor(summary: {
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    expiresAt: Date;
    autoRenewal: boolean;
  }) {
    this.plan = summary.plan;
    this.status = summary.status;
    this.expiresAt = summary.expiresAt;
    this.autoRenewal = summary.autoRenewal;
  }

  /**
   * Determines whether the subscription is nearing expiration (US-45, scenario 2).
   *
   * @returns `true` if the subscription status is expiring soon; otherwise, `false`.
   */
  isExpiringSoon(): boolean {
    return this.status === SubscriptionStatus.ExpiringSoon;
  }

  /**
   * Determines whether the subscription has expired.
   *
   * @returns `true` if the subscription status is expired; otherwise, `false`.
   */
  isExpired(): boolean {
    return this.status === SubscriptionStatus.Expired;
  }
}
