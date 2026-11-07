import { SubscriptionsErrorCode } from '../model/subscriptions-error';
import { BillingPeriod } from './billing-period.value-object';

describe('BillingPeriod', () => {
  const start = new Date(2026, 9, 15);
  const end = new Date(2026, 10, 15);

  it('rejects an end date that is not after the start date', () => {
    expect(() => new BillingPeriod(start, start)).toThrow(SubscriptionsErrorCode.InvalidPeriod);
  });

  it('counts the days left until the end date', () => {
    const period = new BillingPeriod(start, end);

    expect(period.daysUntilEnd(new Date(2026, 10, 5))).toBe(10);
    expect(period.daysUntilEnd(new Date(2026, 11, 1))).toBe(0);
  });
});
