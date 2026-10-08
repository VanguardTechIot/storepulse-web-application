import { BaseEntity } from '../../../shared/domain/model/base-entity';

export type AssetType = 'IOT_DEVICE';
export type AssetStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';

/**
 * Asset assigned to a resource.
 */
export class Asset implements BaseEntity {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly type: AssetType,
    readonly status: AssetStatus,
    readonly resourceId: string,
  ) {}
}
