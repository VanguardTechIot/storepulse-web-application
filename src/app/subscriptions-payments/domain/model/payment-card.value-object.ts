import { SubscriptionsError, SubscriptionsErrorCode } from './subscriptions-error';

export type CardBrand = 'VISA' | 'MASTERCARD' | 'AMEX' | 'OTHER';

/**
 * Card typed in the checkout. Only the brand and the last four digits leave the browser:
 * the payment gateway processes the full number and StorePulse never stores it (mock-up 11a).
 */
export class PaymentCard {
  readonly brand: CardBrand;
  readonly lastFourDigits: string;

  constructor(number: string, expiry: string, reference: Date = new Date()) {
    const digits = number.replace(/\s+/g, '');
    if (!/^\d{13,19}$/.test(digits) || !PaymentCard.isExpiryValid(expiry, reference)) {
      throw new SubscriptionsError(SubscriptionsErrorCode.InvalidCard);
    }
    this.brand = PaymentCard.brandOf(digits);
    this.lastFourDigits = digits.slice(-4);
  }

  /** Text shown in the subscription and the payment history, e.g. `Visa •••• 4821`. */
  get label(): string {
    const names: Record<CardBrand, string> = {
      VISA: 'Visa',
      MASTERCARD: 'Mastercard',
      AMEX: 'Amex',
      OTHER: 'Tarjeta',
    };
    return `${names[this.brand]} •••• ${this.lastFourDigits}`;
  }

  /** `MM/YY` not earlier than the current month. */
  static isExpiryValid(expiry: string, reference: Date = new Date()): boolean {
    const match = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(expiry.trim());
    if (!match) return false;
    const month = Number(match[1]);
    const year = 2000 + Number(match[2]);
    const current = reference.getFullYear() * 12 + reference.getMonth() + 1;
    return year * 12 + month >= current;
  }

  private static brandOf(digits: string): CardBrand {
    if (digits.startsWith('4')) return 'VISA';
    if (/^5[1-5]/.test(digits)) return 'MASTERCARD';
    if (/^3[47]/.test(digits)) return 'AMEX';
    return 'OTHER';
  }
}
