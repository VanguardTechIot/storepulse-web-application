import { MeasurementType } from './measurement-type';

/**
 * Monitoring's own view of a resource and the device installed in it,
 * translated from Resource and Asset Management through the anti-corruption layer.
 */
export interface MonitoredResource {
  resourceId: string;
  name: string;
  description: string;
  floor: string;
  reference: string;
  deviceId: string | null;
  deviceSerialNumber: string | null;
  /** False when the resource or its device is not active, so no telemetry is expected. */
  monitoringAvailable: boolean;
  monitoredTypes: readonly MeasurementType[];
}
