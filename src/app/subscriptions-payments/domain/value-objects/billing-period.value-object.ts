import { SubscriptionsError, SubscriptionsErrorCode } from '../model/subscriptions-error';

const DAY_MS = 24 * 60 * 60 * 1000;

/** Days before the expiration date in which the renewal is reported as near. */
export const EXPIRING_SOON_DAYS = 10;

/**
 * Start and expiration date of a paid subscription period.
 */
export class BillingPeriod {
  constructor(
    readonly startDate: Date,
    readonly endDate: Date,
  ) {
    if (endDate.getTime() <= startDate.getTime()) {
      throw new SubscriptionsError(SubscriptionsErrorCode.InvalidPeriod);
    }
  }

  /** Whole days left until the expiration date; 0 once it has expired. */
  daysUntilEnd(reference: Date = new Date()): number {
    return Math.max(0, Math.ceil((this.endDate.getTime() - reference.getTime()) / DAY_MS));
  }
}
