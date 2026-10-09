import { inject, Injectable } from '@angular/core';
import { RESOURCE_ASSET_REPOSITORY } from '../../../resource-asset-management/infrastructure/resource-asset.token';
import { DeviceConnectivitySummary } from '../../domain/model/device-connectivity-summary';

/**
 * Anti-corruption layer towards Resource and Asset Management: translates the active IoT devices
 * into the connectivity summary of the dashboard.
 */
@Injectable({ providedIn: 'root' })
export class ResourceAssetContextFacade {
  private readonly repository = inject(RESOURCE_ASSET_REPOSITORY);

  /** Devices route where the administrator reviews each device. */
  readonly devicesRoute = ['/devices'];

  async getDeviceConnectivity(): Promise<DeviceConnectivitySummary> {
    const devices = (await this.repository.listIoTDevices()).filter((device) => device.isActive);
    return {
      total: devices.length,
      disconnected: devices.filter((device) => device.isDisconnected).length,
    };
  }
}
