import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';
import { ResourceAssetApi } from '../../../resource-asset-management/infrastructure/resource-asset-api';
import { MonitoredResource } from '../../domain/model/monitored-resource';
import { MEASUREMENT_TYPES, MeasurementType } from '../../domain/model/measurement-type';

/**
 * Anti-corruption layer towards Resource and Asset Management: only the device reference
 * and the location of each resource are translated into the monitoring model.
 */
@Injectable({ providedIn: 'root' })
export class ResourceAssetContextFacade {
  private readonly resourceAssetApi = inject(ResourceAssetApi);

  getMonitoredResources(): Observable<MonitoredResource[]> {
    return forkJoin({
      resources: this.resourceAssetApi.getResources(),
      assets: this.resourceAssetApi.getAssets(),
      devices: this.resourceAssetApi.getIoTDevices(),
      sensors: this.resourceAssetApi.getSensors(),
      meters: this.resourceAssetApi.getMeters(),
    }).pipe(
      map(({ resources, assets, devices, sensors, meters }) =>
        resources.map((resource) => {
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
        }),
      ),
    );
  }
}
