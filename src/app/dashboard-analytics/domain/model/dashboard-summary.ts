import { UtilityType } from './utility-type.enum';

/**
 * Consumption of a utility in the current period compared with the previous one.
 */
export class PeriodConsumption {
  constructor(
    readonly utilityType: UtilityType,
    readonly period: string,
    readonly current: number,
    readonly previous: number | null,
    readonly unit: string,
  ) {}

  /** Percentage change against the previous period; `null` without a previous period. */
  get variationPercent(): number | null {
    if (this.previous === null || this.previous === 0) return null;
    return ((this.current - this.previous) / this.previous) * 100;
  }
}

/**
 * Read model of the Consolidated Dashboard (US-50, TS-31). A field is `null` when there is not
 * enough data for that indicator, instead of failing the whole summary.
 */
export class DashboardSummary {
  constructor(
    readonly activeIncidents: number | null,
    readonly electricity: PeriodConsumption | null,
    readonly water: PeriodConsumption | null,
    readonly disconnectedDevices: number | null,
    readonly registeredDevices: number | null,
  ) {}

  /** US-50, scenario 2: a new gallery without devices or measurements. */
  get hasActivity(): boolean {
    return (
      (this.registeredDevices ?? 0) > 0 ||
      this.electricity !== null ||
      this.water !== null ||
      (this.activeIncidents ?? 0) > 0
    );
  }
}
