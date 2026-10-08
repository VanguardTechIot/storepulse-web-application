import { BaseEntity } from '../../../shared/domain/model/base-entity';
import { MeasurementType } from './measurement-type';

/**
 * Single measurement contained in a telemetry record.
 */
export class Measurement implements BaseEntity {
  constructor(
    readonly id: string,
    readonly telemetryId: string,
    readonly type: MeasurementType,
    readonly value: number,
    readonly unit: string,
    readonly recordedAt: Date,
  ) {}

  validate(): boolean {
    return Number.isFinite(this.value) && !Number.isNaN(this.recordedAt.getTime());
  }
}
