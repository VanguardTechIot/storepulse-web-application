import { BaseEntity } from '../../../shared/domain/model/base-entity';
import { MeasurementType } from './measurement-type';
import { Measurement } from './measurement.entity';
import { Threshold } from './threshold';

/**
 * Aggregate root: condition evaluated over the measurements of one type.
 */
export class MonitoringRule implements BaseEntity {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly measurementType: MeasurementType,
    readonly threshold: Threshold,
    readonly enabled: boolean,
    readonly createdAt: Date,
  ) {}

  enable(): MonitoringRule {
    return this.withEnabled(true);
  }

  disable(): MonitoringRule {
    return this.withEnabled(false);
  }

  /** True when the rule is enabled, applies to the measurement type and its threshold is met. */
  evaluate(measurement: Measurement): boolean {
    return (
      this.enabled &&
      measurement.type === this.measurementType &&
      this.threshold.evaluate(measurement.value)
    );
  }

  private withEnabled(enabled: boolean): MonitoringRule {
    return new MonitoringRule(this.id, this.name, this.measurementType, this.threshold, enabled, this.createdAt);
  }
}
