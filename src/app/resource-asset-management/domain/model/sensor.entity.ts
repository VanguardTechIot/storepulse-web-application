import { BaseEntity } from '../../../shared/domain/model/base-entity';
import { AssetStatus } from './asset.entity';

export type SensorType =
  'MOTION' | 'DOOR_STATE' | 'SMOKE' | 'HUMIDITY' | 'TEMPERATURE' | 'WATER' | 'ELECTRICITY';
/**
 * Sensor attached to an IoT device.
 */
export class Sensor implements BaseEntity {
  constructor(
    readonly id: string,
    readonly iotDeviceId: string,
    readonly type: SensorType,
    readonly unit: string,
    readonly status: AssetStatus,
  ) {}
}
