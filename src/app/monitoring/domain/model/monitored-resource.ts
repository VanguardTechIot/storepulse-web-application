import { MeasurementType } from './measurement-type';

export interface MonitoredResource {
  resourceId: string;
  name: string;
  description: string;
  floor: string;
  reference: string;
  deviceId: string | null;
  deviceSerialNumber: string | null;
  monitoringAvailable: boolean;
  monitoredTypes: readonly MeasurementType[];
}
