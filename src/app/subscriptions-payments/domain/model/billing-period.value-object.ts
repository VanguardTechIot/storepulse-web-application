import { BillingCycle } from './billing-cycle.enum';
import { SubscriptionsError, SubscriptionsErrorCode } from './subscriptions-error';

const DAY_MS = 24 * 60 * 60 * 1000;

/** Days before the expiration date in which the renewal is reported as near (US-45, scenario 2). */
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

  /** Period of one cycle that begins at `start`. */
  static startingAt(start: Date, cycle: BillingCycle): BillingPeriod {
    const end = new Date(start);
    if (cycle === BillingCycle.Annual) end.setFullYear(end.getFullYear() + 1);
    else end.setMonth(end.getMonth() + 1);
    return new BillingPeriod(start, end);
  }

  hasExpired(reference: Date = new Date()): boolean {
    return reference.getTime() >= this.endDate.getTime();
  }

  /** Whole days left until the expiration date; 0 once it has expired. */
  daysUntilEnd(reference: Date = new Date()): number {
    return Math.max(0, Math.ceil((this.endDate.getTime() - reference.getTime()) / DAY_MS));
  }

  /** Following period, used by the automatic renewal (US-48). */
  next(cycle: BillingCycle): BillingPeriod {
    return BillingPeriod.startingAt(this.endDate, cycle);
  }
}
