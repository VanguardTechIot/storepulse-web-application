import { BaseResource } from '../../../shared/infrastructure/base-response';
import { MeasurementType } from '../../domain/model/measurement-type';

export interface MeasurementResource extends BaseResource {
  telemetryId: string;
  type: MeasurementType;
  value: number;
  unit: string;
  recordedAt: string;
}

export interface TelemetryResource extends BaseResource {
  deviceId: string;
  receivedAt: string;
  measurements?: MeasurementResource[];
}
