import { BaseResource } from '../../shared/infrastructure/base-response';
import { Location, ResourceStatus } from '../domain/model/resource.entity';
import { AssetStatus, AssetType } from '../domain/model/asset.entity';
import { SensorType } from '../domain/model/sensor.entity';
import { MeterType } from '../domain/model/meter.entity';

export interface ResourceResource extends BaseResource {
  name: string;
  description: string;
  location: Location;
  status: ResourceStatus;
}

export interface AssetResource extends BaseResource {
  name: string;
  type: AssetType;
  status: AssetStatus;
  resourceId: string;
}

export interface IoTDeviceResource extends BaseResource {
  assetId: string;
  serialNumber: string;
  manufacturer: string;
  firmwareVersion: string;
  status: AssetStatus;
}

export interface SensorResource extends BaseResource {
  iotDeviceId: string;
  type: SensorType;
  unit: string;
  status: AssetStatus;
}

export interface MeterResource extends BaseResource {
  iotDeviceId: string;
  type: MeterType;
  unit: string;
  status: AssetStatus;
}
