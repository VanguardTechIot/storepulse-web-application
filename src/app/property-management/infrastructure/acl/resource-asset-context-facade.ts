import { inject, Injectable } from '@angular/core';
import { CommercialUnit } from '../../domain/model/commercial-unit.entity';
import { RESOURCE_ASSET_REPOSITORY } from '../../../resource-asset-management/infrastructure/resource-asset.token';

/**
 * Anti-corruption layer towards Resource and Asset Management: the IoT devices installed in a
 * unit, which prevent its removal.
 *
 * That context names its resources after the unit (`Local A-03`, or the common area name), so the
 * unit is matched by that name. When resources carry the unit id, only this class changes.
 */
@Injectable({ providedIn: 'root' })
export class ResourceAssetContextFacade {
  private readonly repository = inject(RESOURCE_ASSET_REPOSITORY);

  /** Serial numbers of the devices linked to the unit. */
  async linkedDeviceSerials(unit: CommercialUnit): Promise<string[]> {
    const [resources, devices] = await Promise.all([
      this.repository.listResources(),
      this.repository.listIoTDevices(),
    ]);
    const names = unit.isStore ? [unit.code, `Local ${unit.code}`] : [unit.code];
    const resourceIds = new Set(
      resources
        .filter((resource) => names.some((name) => CommercialUnit.sameCode(resource.name, name)))
        .map((resource) => resource.id),
    );
    return devices
      .filter((device) => resourceIds.has(device.resourceId))
      .map((device) => device.serialNumber);
  }
}
