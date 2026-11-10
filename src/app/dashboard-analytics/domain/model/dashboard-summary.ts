import { SensorType } from '../enums/sensor-type.enum';
import { ConsumptionValue } from '../value-objects/consumption-value.value-object';

/** Alerts of the gallery by state; `open` counts the active and the acknowledged ones. */
export interface AlertCounts {
  open: number;
  active: number;
  acknowledged: number;
  resolved: number;
  /** Only the sensor types that have open alerts. */
  openBySensorType: Partial<Record<SensorType, number>>;
}

/** Key indicators of the consolidated dashboard: alerts and consumption of the current month. */
export class DashboardSummary {
  constructor(
    readonly alerts: AlertCounts,
    readonly electricity: ConsumptionValue,
    readonly water: ConsumptionValue,
  ) {}

  get hasActivity(): boolean {
    return (
      this.alerts.open + this.alerts.resolved > 0 ||
      this.electricity.amount > 0 ||
      this.water.amount > 0
    );
  }
}
