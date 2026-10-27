import { BaseEntity } from '../../../shared/domain/model/base-entity';
import { Measurement } from './measurement.entity';

/**
 * Aggregate root: telemetry received from an IoT device, grouping one or more measurements.
 */
export class Telemetry implements BaseEntity {
  constructor(
    readonly id: string,
    readonly deviceId: string,
    readonly receivedAt: Date,
    readonly measurements: readonly Measurement[],
  ) {}

  validate(): boolean {
    return this.measurements.length > 0 && this.measurements.every((measurement) => measurement.validate());
  }
}
