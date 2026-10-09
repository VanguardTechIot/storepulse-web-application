import { BaseEntity } from '../../../shared/domain/model/base-entity';
import { AssetStatus } from './asset.entity';

export type MeterType = 'WATER' | 'ELECTRICITY';

/**
 * Utility meter attached to an IoT device.
 */
export class Meter implements BaseEntity {
  constructor(
    readonly id: string,
    readonly iotDeviceId: string,
    readonly type: MeterType,
    readonly unit: string,
    readonly status: AssetStatus,
  ) {}
}
