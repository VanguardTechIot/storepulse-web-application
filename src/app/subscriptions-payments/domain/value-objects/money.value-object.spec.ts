import { SubscriptionsError, SubscriptionsErrorCode } from '../model/subscriptions-error';
import { Money } from './money.value-object';

describe('Money', () => {
  it('uses soles when no currency is given', () => {
    expect(new Money(290).currency).toBe('PEN');
  });

  it('rejects negative or non-finite amounts', () => {
    for (const amount of [-1, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(() => new Money(amount)).toThrow(SubscriptionsError);
    }
    expect(() => new Money(-1)).toThrow(SubscriptionsErrorCode.InvalidAmount);
  });

  it('is equal to another amount with the same value and currency', () => {
    expect(new Money(290).equals(new Money(290, 'PEN'))).toBe(true);
    expect(new Money(290).equals(new Money(290, 'USD'))).toBe(false);
  });
});
