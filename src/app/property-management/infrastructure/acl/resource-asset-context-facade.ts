import { inject, Injectable } from '@angular/core';
import { RESOURCE_ASSET_REPOSITORY } from '../../../resource-asset-management/infrastructure/resource-asset.token';
import { CommercialUnit } from '../../domain/model/commercial-unit.entity';
import { UnitResource } from '../../domain/model/unit-resource';

/**
 * Anti-corruption layer towards Resource and Asset Management: the monitored resources a unit can
 * be linked to, and the IoT devices installed in its resource, which prevent its removal.
 */
@Injectable({ providedIn: 'root' })
export class ResourceAssetContextFacade {
  private readonly repository = inject(RESOURCE_ASSET_REPOSITORY);

  /** Active resources, sorted by name. */
  async listResources(): Promise<UnitResource[]> {
    const resources = await this.repository.listResources();
    return resources
      .filter((resource) => resource.isActive)
      .map((resource) => ({ resourceId: resource.id, name: resource.name }))
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
  }

  /** Serial numbers of the devices installed in the resource linked to the unit. */
  async linkedDeviceSerials(unit: CommercialUnit): Promise<string[]> {
    if (!unit.resourceId) return [];
    const devices = await this.repository.listIoTDevices();
    return devices
      .filter((device) => device.resourceId === unit.resourceId)
      .map((device) => device.serialNumber);
  }
}
