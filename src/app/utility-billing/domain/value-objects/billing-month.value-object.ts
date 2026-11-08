import { BillingError, BillingErrorCode } from '../model/billing-error';

const MONTH_PATTERN = /^(\d{4})-(0[1-9]|1[0-2])$/;

/** Calendar month a bill covers, written as `yyyy-MM`. */
export class BillingMonth {
  readonly year: number;
  readonly month: number;

  constructor(readonly value: string) {
    const match = MONTH_PATTERN.exec(value);
    if (!match) throw new BillingError(BillingErrorCode.InvalidPeriod);
    this.year = Number(match[1]);
    this.month = Number(match[2]);
  }

  /** The closed months before the current one, most recent first. */
  static recent(count: number, today: Date = new Date()): BillingMonth[] {
    return Array.from({ length: count }, (_, index) => {
      const date = new Date(today.getFullYear(), today.getMonth() - 1 - index, 1);
      return new BillingMonth(
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      );
    });
  }

  /** First day of the month, in local time. */
  get start(): Date {
    return new Date(this.year, this.month - 1, 1);
  }

  /** Last day of the month, in local time. */
  get end(): Date {
    return new Date(this.year, this.month, 0);
  }

  equals(other: BillingMonth): boolean {
    return this.value === other.value;
  }
}
