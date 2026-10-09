import { AnalyticsError, AnalyticsErrorCode } from './analytics-error';

/**
 * Numeric value of a reading or a consumption with its unit (kWh or m³). Never negative.
 */
export class ConsumptionValue {
  constructor(
    readonly amount: number,
    readonly unit: string,
  ) {
    if (!Number.isFinite(amount) || amount < 0) {
      throw new AnalyticsError(AnalyticsErrorCode.InvalidConsumptionValue);
    }
  }

  plus(other: ConsumptionValue): ConsumptionValue {
    return new ConsumptionValue(this.amount + other.amount, this.unit);
  }
}
