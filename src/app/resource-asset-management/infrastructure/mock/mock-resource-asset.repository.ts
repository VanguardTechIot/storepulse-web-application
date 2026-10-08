import { Resource } from '../../domain/model/resource.entity';
import { Asset } from '../../domain/model/asset.entity';
import { IoTDevice } from '../../domain/model/iot-device.entity';
import { Sensor } from '../../domain/model/sensor.entity';
import { Meter } from '../../domain/model/meter.entity';
import { ResourceAssetRepository } from '../../domain/repository/resource-asset.repository';
import {
  AssetAssembler,
  IoTDeviceAssembler,
  MeterAssembler,
  ResourceAssembler,
  SensorAssembler,
} from '../resource-asset-assemblers';
import { ASSETS, IOT_DEVICES, METERS, RESOURCES, SENSORS } from './resource-asset.data';

/** Implementación en memoria del repositorio de Resource and Asset Management. */
export class MockResourceAssetRepository implements ResourceAssetRepository {
  private readonly resourceAssembler = new ResourceAssembler();
  private readonly assetAssembler = new AssetAssembler();
  private readonly ioTDeviceAssembler = new IoTDeviceAssembler();
  private readonly sensorAssembler = new SensorAssembler();
  private readonly meterAssembler = new MeterAssembler();

  async listResources(): Promise<Resource[]> {
    return structuredClone(RESOURCES).map((r) => this.resourceAssembler.toEntityFromResource(r));
  }

  async listAssets(): Promise<Asset[]> {
    return structuredClone(ASSETS).map((r) => this.assetAssembler.toEntityFromResource(r));
  }

  async listIoTDevices(): Promise<IoTDevice[]> {
    return structuredClone(IOT_DEVICES).map((r) => this.ioTDeviceAssembler.toEntityFromResource(r));
  }

  async listSensors(): Promise<Sensor[]> {
    return structuredClone(SENSORS).map((r) => this.sensorAssembler.toEntityFromResource(r));
  }

  async listMeters(): Promise<Meter[]> {
    return structuredClone(METERS).map((r) => this.meterAssembler.toEntityFromResource(r));
  }
}
