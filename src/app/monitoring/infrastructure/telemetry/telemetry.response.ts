import { MeasurementType } from '../../domain/model/measurement-type';

export interface MeasurementResource {
  id: number;
  type: MeasurementType;
  value: number;
  unit: string;
  recordedAt: string;
}

/** Telemetry as `GET /telemetry` returns it, with its measurements embedded. */
export interface TelemetryResource {
  id: number;
  deviceId: number;
  receivedAt: string;
  measurements: MeasurementResource[];
}
