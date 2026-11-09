import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiError } from '../../../shared/domain/model/api-error';
import { sendRequest } from '../../../shared/infrastructure/send-request';
import { IoTDevice, IoTDeviceType } from '../../domain/model/iot-device.entity';
import { Resource } from '../../domain/model/resource.entity';
import {
  ResourceAssetError,
  ResourceAssetErrorCode,
} from '../../domain/model/resource-asset-error';
import { ResourceAssetRepository } from '../../domain/repository/resource-asset.repository';
import { IoTDeviceAssembler, ResourceAssembler } from '../resource-asset-assemblers';
import {
  DeactivateIoTDeviceResource,
  IoTDeviceResource,
  RegisterIoTDeviceResource,
  ResourceResource,
} from '../resource-asset-responses';

const apiUrl = environment.platformProviderApiBaseUrl;
const resourcesUrl = `${apiUrl}${environment.platformProviderResourcesEndpointPath}`;
const devicesUrl = `${apiUrl}${environment.platformProviderIoTDevicesEndpointPath}`;

const codes = new Set<string>(Object.values(ResourceAssetErrorCode));

/** The platform answers the business code in `message`. */
const failed = (error: ApiError) => {
  if (error.isNetworkFailure) return new ResourceAssetError(ResourceAssetErrorCode.Network);
  if (codes.has(error.message))
    return new ResourceAssetError(error.message as ResourceAssetErrorCode);
  return new ResourceAssetError(ResourceAssetErrorCode.Unexpected);
};

/**
 * HTTP implementation of the repository over the platform API (json-server locally, with the
 * same contract as the REST API).
 */
export class HttpResourceAssetRepository implements ResourceAssetRepository {
  private readonly http = inject(HttpClient);
  private readonly resourceAssembler = new ResourceAssembler();
  private readonly deviceAssembler = new IoTDeviceAssembler();

  async listResources(): Promise<Resource[]> {
    const resources = await sendRequest(this.http.get<ResourceResource[]>(resourcesUrl), failed);
    return resources.map((r) => this.resourceAssembler.toEntityFromResource(r));
  }

  async listIoTDevices(): Promise<IoTDevice[]> {
    const resources = await sendRequest(this.http.get<IoTDeviceResource[]>(devicesUrl), failed);
    return resources.map((r) => this.deviceAssembler.toEntityFromResource(r));
  }

  registerIoTDevice(
    serialNumber: string,
    type: IoTDeviceType,
    resourceId: string,
  ): Promise<IoTDevice> {
    const body: RegisterIoTDeviceResource = { serialNumber, type, resourceId };
    return this.sendDevice(this.http.post<IoTDeviceResource>(devicesUrl, body));
  }

  deactivateIoTDevice(deviceId: string, reason: string): Promise<IoTDevice> {
    const body: DeactivateIoTDeviceResource = { reason: reason || null };
    const url = `${this.deviceUrl(deviceId)}/deactivation`;
    return this.sendDevice(this.http.patch<IoTDeviceResource>(url, body));
  }

  reactivateIoTDevice(deviceId: string): Promise<IoTDevice> {
    const url = `${this.deviceUrl(deviceId)}/reactivation`;
    return this.sendDevice(this.http.patch<IoTDeviceResource>(url, null));
  }

  private deviceUrl(deviceId: string): string {
    return `${devicesUrl}/${encodeURIComponent(deviceId)}`;
  }

  private async sendDevice(request: Observable<IoTDeviceResource>): Promise<IoTDevice> {
    return this.deviceAssembler.toEntityFromResource(await sendRequest(request, failed));
  }
}
