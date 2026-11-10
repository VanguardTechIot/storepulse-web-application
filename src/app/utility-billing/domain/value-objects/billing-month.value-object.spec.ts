import { BillingError } from '../model/billing-error';
import { BillingMonth } from './billing-month.value-object';

describe('BillingMonth', () => {
  it('covers the whole calendar month', () => {
    const month = new BillingMonth('2026-02');

    expect(month.start).toEqual(new Date(2026, 1, 1));
    expect(month.end).toEqual(new Date(2026, 1, 28));
  });

  it('rejects a value that is not yyyy-MM', () => {
    expect(() => new BillingMonth('2026-13')).toThrow(BillingError);
    expect(() => new BillingMonth('10/2026')).toThrow(BillingError);
  });

  it('lists the closed months before the current one, newest first', () => {
    const months = BillingMonth.recent(3, new Date(2026, 0, 15));

    expect(months.map((m) => m.value)).toEqual(['2025-12', '2025-11', '2025-10']);
  });
});
