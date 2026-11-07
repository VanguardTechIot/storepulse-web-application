import { SubscriptionsErrorCode } from '../model/subscriptions-error';
import { PaymentCard } from './payment-card.value-object';

describe('PaymentCard', () => {
  const reference = new Date('2026-10-30T10:00:00Z');

  it('keeps only the brand and the last four digits', () => {
    const card = new PaymentCard('4111 1111 1111 4821', '12/27', reference);

    expect(card.brand).toBe('VISA');
    expect(card.lastFourDigits).toBe('4821');
    expect(card.label).toBe('Visa •••• 4821');
  });

  it('detects the brand from the first digits', () => {
    expect(new PaymentCard('5500000000000004', '12/27', reference).brand).toBe('MASTERCARD');
    expect(new PaymentCard('371449635398431', '12/27', reference).brand).toBe('AMEX');
    expect(new PaymentCard('6011000000000004', '12/27', reference).brand).toBe('OTHER');
  });

  it('rejects an invalid number or an expired card', () => {
    expect(() => new PaymentCard('4111', '12/27', reference)).toThrow(
      SubscriptionsErrorCode.InvalidCard,
    );
    expect(() => new PaymentCard('4111111111114821', '09/26', reference)).toThrow(
      SubscriptionsErrorCode.InvalidCard,
    );
  });

  it('accepts the current month as expiry', () => {
    expect(PaymentCard.isExpiryValid('10/26', reference)).toBe(true);
    expect(PaymentCard.isExpiryValid('13/26', reference)).toBe(false);
  });
});
