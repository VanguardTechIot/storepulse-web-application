import { Consumption } from './consumption.entity';

/** Minimum number of previous periods required to compare against the baseline. */
export const MIN_BASELINE_PERIODS = 3;
/** Maximum number of previous periods included in the historical average. */
export const MAX_BASELINE_PERIODS = 12;

/**
 * Comparison of a period's consumption against the historical average of the previous periods.
 */
export class ConsumptionBaseline {
  private constructor(
    readonly current: Consumption | null,
    readonly previousPeriods: readonly Consumption[],
  ) {}

  /**
   * @param history consumption records of a single resource and measurement type.
   * @param periodKey selected period (YYYY-MM).
   */
  static from(history: readonly Consumption[], periodKey: string): ConsumptionBaseline {
    const current = history.find((record) => record.periodKey === periodKey) ?? null;
    const previous = history
      .filter((record) => record.periodKey < periodKey)
      .sort((a, b) => b.periodKey.localeCompare(a.periodKey))
      .slice(0, MAX_BASELINE_PERIODS);
    return new ConsumptionBaseline(current, previous);
  }

  get isAvailable(): boolean {
    return this.previousPeriods.length >= MIN_BASELINE_PERIODS;
  }

  get missingPeriods(): number {
    return Math.max(0, MIN_BASELINE_PERIODS - this.previousPeriods.length);
  }

  /** Historical average per period of the previous periods. */
  get historicalAverage(): number | null {
    if (!this.isAvailable) return null;
    return this.previousPeriods.reduce((sum, record) => sum + record.totalValue, 0) / this.previousPeriods.length;
  }

  /** Percentage deviation of the current period, compared by daily rate. */
  get deviationPercent(): number | null {
    if (!this.isAvailable || !this.current) return null;
    const baselineRate =
      this.previousPeriods.reduce((sum, record) => sum + record.dailyRate, 0) / this.previousPeriods.length;
    if (baselineRate === 0) return null;
    return ((this.current.dailyRate - baselineRate) / baselineRate) * 100;
  }
}
