import { SubscriptionPlan } from './subscription-plan.enum';
import { SubscriptionStatus } from './subscription-status.enum';

/**
 * Subscription of the gallery as the profile shows it (US-45): plan, status and expiration date.
 * It belongs to Subscriptions and Payments; this context only reads it.
 */
export class SubscriptionSummary {
  readonly plan: SubscriptionPlan;
  readonly status: SubscriptionStatus;
  readonly expiresAt: Date;
  readonly autoRenewal: boolean;

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

  /** US-45, scenario 2: the profile warns that the renewal is near. */
  isExpiringSoon(): boolean {
    return this.status === SubscriptionStatus.ExpiringSoon;
  }

  isExpired(): boolean {
    return this.status === SubscriptionStatus.Expired;
  }
}
