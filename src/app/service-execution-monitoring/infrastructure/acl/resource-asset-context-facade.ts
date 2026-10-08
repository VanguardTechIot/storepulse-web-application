import { inject, Injectable } from '@angular/core';
import { RESOURCE_ASSET_REPOSITORY } from '../../../resource-asset-management/infrastructure/resource-asset.token';
import { MonitoredResource } from '../../domain/model/monitored-resource';
import { MEASUREMENT_TYPES, MeasurementType } from '../../domain/model/measurement-type';

/**
 * Anti-corruption layer towards Resource and Asset Management: only the device reference
 * and the location of each resource are translated into the monitoring model.
 */
@Injectable({ providedIn: 'root' })
export class ResourceAssetContextFacade {
  private readonly repository = inject(RESOURCE_ASSET_REPOSITORY);

  async getMonitoredResources(): Promise<MonitoredResource[]> {
    const [resources, assets, devices, sensors, meters] = await Promise.all([
      this.repository.listResources(),
      this.repository.listAssets(),
      this.repository.listIoTDevices(),
      this.repository.listSensors(),
      this.repository.listMeters(),
    ]);
    return resources.map((resource) => {
      const asset = assets.find((a) => a.resourceId === resource.id && a.type === 'IOT_DEVICE');
      const device = asset ? devices.find((d) => d.assetId === asset.id) : undefined;
      const activeTypes = new Set<MeasurementType>(
        [...sensors, ...meters]
          .filter((component) => component.iotDeviceId === device?.id && component.status === 'ACTIVE')
          .map((component) => component.type),
      );
      return {
        resourceId: resource.id,
        name: resource.name,
        description: resource.description,
        floor: resource.location.floor,
        reference: resource.location.reference,
        deviceId: device?.id ?? null,
        deviceSerialNumber: device?.serialNumber ?? null,
        monitoringAvailable: resource.isActive && !!device?.isActive,
        monitoredTypes: MEASUREMENT_TYPES.filter((type) => activeTypes.has(type)),
      };
    });
  }
}
