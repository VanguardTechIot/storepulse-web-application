import { AnalyticsErrorCode } from '../model/analytics-error';
import { ConsumptionValue } from './consumption-value.value-object';

describe('ConsumptionValue', () => {
  it('rejects negative or non-finite amounts', () => {
    expect(() => new ConsumptionValue(-5, 'kWh')).toThrow(
      AnalyticsErrorCode.InvalidConsumptionValue,
    );
    expect(() => new ConsumptionValue(Number.NaN, 'kWh')).toThrow(
      AnalyticsErrorCode.InvalidConsumptionValue,
    );
  });

  it('adds values of the same unit', () => {
    const total = new ConsumptionValue(120, 'kWh').plus(new ConsumptionValue(30, 'kWh'));

    expect(total.equals(new ConsumptionValue(150, 'kWh'))).toBe(true);
  });
});
