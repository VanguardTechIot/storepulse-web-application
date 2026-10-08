import { BaseEntity } from '../../../shared/domain/model/base-entity';

export type ResourceStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';

export interface Location {
  address: string;
  floor: string;
  reference: string;
}

/**
 * Resource managed by StorePulse (a commercial unit or a common area of the gallery).
 */
export class Resource implements BaseEntity {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly description: string,
    readonly location: Location,
    readonly status: ResourceStatus,
  ) {}

  get isActive(): boolean {
    return this.status === 'ACTIVE';
  }
}
