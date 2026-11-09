import { ResourceStatus } from '../domain/model/resource.entity';
import { AssetStatus, ConnectivityStatus, IoTDeviceType } from '../domain/model/iot-device.entity';

/** Identifier as the platform writes it: numeric in the REST API, text in the local data server. */
export type ResourceId = number | string;

export interface ResourceResource {
  id: ResourceId;
  name: string;
  description: string;
  address: string;
  floor: string;
  reference: string;
  status: ResourceStatus;
}

export interface IoTDeviceResource {
  id: ResourceId;
  assetId: ResourceId;
  resourceId: ResourceId;
  serialNumber: string;
  manufacturer: string | null;
  firmwareVersion: string | null;
  type: IoTDeviceType;
  status: AssetStatus;
  connectivity: ConnectivityStatus;
  lastReportAt: string | null;
  supplyVoltage: number | null;
  bufferedEvents: number;
  deactivationReason: string | null;
  actuators: string[];
}

export interface RegisterIoTDeviceResource {
  serialNumber: string;
  type: IoTDeviceType;
  resourceId: ResourceId;
}

export interface DeactivateIoTDeviceResource {
  reason: string | null;
}
