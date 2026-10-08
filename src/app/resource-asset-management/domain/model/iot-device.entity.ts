import { BaseEntity } from '../../../shared/domain/model/base-entity';
import { AssetStatus } from './asset.entity';

/**
 * IoT device represented by an asset.
 */
export class IoTDevice implements BaseEntity {
  constructor(
    readonly id: string,
    readonly assetId: string,
    readonly serialNumber: string,
    readonly manufacturer: string,
    readonly firmwareVersion: string,
    readonly status: AssetStatus,
  ) {}

  get isActive(): boolean {
    return this.status === 'ACTIVE';
  }
}
