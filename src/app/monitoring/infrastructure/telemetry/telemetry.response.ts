import { MeasurementType } from '../../domain/model/measurement-type';

export interface MeasurementResource {
  id: number;
  type: MeasurementType;
  value: number;
  unit: string;
  recordedAt: string;
}

export interface TelemetryResource {
  id: number;
  deviceId: number;
  receivedAt: string;
  measurements: MeasurementResource[];
}
