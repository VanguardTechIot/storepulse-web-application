import { inject, Injectable } from '@angular/core';
import { RESOURCE_ASSET_REPOSITORY } from '../../../resource-asset-management/infrastructure/resource-asset.token';
import { UnitReference } from '../../domain/model/unit-reference';

/** Resource names of commercial units read "Local <code>"; common areas have no code. */
const UNIT_NAME = /^Local\s+(\S+)$/;

/**
 * Anti-corruption layer towards Resource and Asset Management. Until Property Management is
 * available, a unit is the resource Monitoring records its consumption against.
 */
@Injectable({ providedIn: 'root' })
export class ResourceAssetContextFacade {
  private readonly repository = inject(RESOURCE_ASSET_REPOSITORY);

  async listUnits(): Promise<UnitReference[]> {
    return (await this.repository.listResources()).flatMap((resource) => {
      const code = UNIT_NAME.exec(resource.name)?.[1];
      return code
        ? [{ id: resource.id, code, name: resource.name, tenantName: resource.description }]
        : [];
    });
  }
}
