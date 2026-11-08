import { UtilityType } from '../enums/utility-type.enum';

/** Relative deviation over the baseline from which a consumption is flagged. */
export const BASELINE_ALERT_THRESHOLD = 0.2;

/** Line of the breakdown of a bill: the consumption of one utility and what it costs. */
export class BillingItem {
  constructor(
    readonly utilityType: UtilityType,
    readonly consumption: number,
    readonly baseline: number,
    readonly unitOfMeasure: string,
    readonly rate: number,
    readonly amount: number,
  ) {}

  /** Deviation against the baseline (0.25 means 25 % above it). */
  get varianceRatio(): number {
    return this.baseline === 0 ? 0 : (this.consumption - this.baseline) / this.baseline;
  }

  get exceedsBaseline(): boolean {
    return this.varianceRatio > BASELINE_ALERT_THRESHOLD;
  }
}
