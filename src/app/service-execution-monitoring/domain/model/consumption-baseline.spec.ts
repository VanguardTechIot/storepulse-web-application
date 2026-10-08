import { Consumption } from './consumption.entity';
import { ConsumptionBaseline } from './consumption-baseline';

const month = (m: number, total: number, endDay?: number) =>
  new Consumption(
    `cns-${m}`,
    'res-1',
    'ELECTRICITY',
    total,
    'kWh',
    new Date(Date.UTC(2026, m - 1, 1, 5)),
    endDay ? new Date(Date.UTC(2026, m - 1, endDay, 5)) : new Date(Date.UTC(2026, m, 1, 5)),
  );

describe('ConsumptionBaseline', () => {
  it('is not available with fewer than 3 previous periods', () => {
    const baseline = ConsumptionBaseline.from([month(8, 100), month(9, 110)], '2026-09');

    expect(baseline.isAvailable).toBe(false);
    expect(baseline.missingPeriods).toBe(2);
    expect(baseline.historicalAverage).toBeNull();
    expect(baseline.deviationPercent).toBeNull();
  });

  it('compares the period against the average of the previous periods', () => {
    const history = [month(4, 300), month(6, 300), month(7, 310), month(9, 310)];
    const baseline = ConsumptionBaseline.from(history, '2026-09');

    expect(baseline.isAvailable).toBe(true);
    expect(baseline.current?.totalValue).toBe(310);
    expect(baseline.historicalAverage).toBeCloseTo(303.33, 2);
    expect(baseline.deviationPercent).toBeGreaterThan(0);
  });

  it('compares an open period by daily rate', () => {
    // June, July and August: 300 kWh per 30/31 days ≈ 9.8 kWh/day; October so far: 98 kWh in 10 days.
    const history = [month(6, 294), month(7, 303.8), month(8, 303.8), month(10, 98, 11)];
    const baseline = ConsumptionBaseline.from(history, '2026-10');

    expect(baseline.deviationPercent).toBeCloseTo(0, 0);
  });
});
