import { SubscriptionsError, SubscriptionsErrorCode } from './subscriptions-error';

/**
 * Amount and currency of a price or a charge. The amount is never negative.
 */
export class Money {
  constructor(
    readonly amount: number,
    readonly currency: string = 'PEN',
  ) {
    if (!Number.isFinite(amount) || amount < 0) {
      throw new SubscriptionsError(SubscriptionsErrorCode.InvalidAmount);
    }
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }
}
