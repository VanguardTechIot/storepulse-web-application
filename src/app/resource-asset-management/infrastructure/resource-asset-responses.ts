import { ResourceStatus } from '../domain/model/resource.entity';
import { AssetStatus, ConnectivityStatus, IoTDeviceType } from '../domain/model/iot-device.entity';

export interface ResourceResource {
  id: number;
  name: string;
  description: string;
  address: string;
  floor: string;
  reference: string;
  status: ResourceStatus;
}

export interface IoTDeviceResource {
  id: number;
  assetId: number;
  resourceId: number;
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
  resourceId: number;
}

export interface DeactivateIoTDeviceResource {
  reason: string | null;
}
