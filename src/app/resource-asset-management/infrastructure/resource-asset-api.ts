import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BaseApi } from '../../shared/infrastructure/base-api';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { Resource } from '../domain/model/resource.entity';
import { Asset } from '../domain/model/asset.entity';
import { IoTDevice } from '../domain/model/iot-device.entity';
import { Sensor } from '../domain/model/sensor.entity';
import { Meter } from '../domain/model/meter.entity';
import {
  AssetAssembler,
  IoTDeviceAssembler,
  MeterAssembler,
  ResourceAssembler,
  SensorAssembler,
} from './resource-asset-assemblers';

/**
 * Read access to the Resource and Asset Management REST endpoints.
 */
@Injectable({ providedIn: 'root' })
export class ResourceAssetApi extends BaseApi {
  private readonly resources = new BaseApiEndpoint(
    this.http,
    this.endpointUrl(environment.resourcesEndpointPath),
    new ResourceAssembler(),
  );
  private readonly assets = new BaseApiEndpoint(
    this.http,
    this.endpointUrl(environment.assetsEndpointPath),
    new AssetAssembler(),
  );
  private readonly iotDevices = new BaseApiEndpoint(
    this.http,
    this.endpointUrl(environment.iotDevicesEndpointPath),
    new IoTDeviceAssembler(),
  );
  private readonly sensors = new BaseApiEndpoint(
    this.http,
    this.endpointUrl(environment.sensorsEndpointPath),
    new SensorAssembler(),
  );
  private readonly meters = new BaseApiEndpoint(
    this.http,
    this.endpointUrl(environment.metersEndpointPath),
    new MeterAssembler(),
  );

  getResources(): Observable<Resource[]> {
    return this.resources.getAll();
  }

  getAssets(): Observable<Asset[]> {
    return this.assets.getAll();
  }

  getIoTDevices(): Observable<IoTDevice[]> {
    return this.iotDevices.getAll();
  }

  getSensors(): Observable<Sensor[]> {
    return this.sensors.getAll();
  }

  getMeters(): Observable<Meter[]> {
    return this.meters.getAll();
  }
}
