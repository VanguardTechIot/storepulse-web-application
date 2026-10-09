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
import { AssetResource, IoTDeviceResource } from '../resource-asset-responses';
import { ASSETS, IOT_DEVICES, METERS, RESOURCES, SENSORS } from './resource-asset.data';

/** Implementación en memoria del repositorio de Resource and Asset Management. */
export class MockResourceAssetRepository implements ResourceAssetRepository {
  private readonly resourceAssembler = new ResourceAssembler();
  private readonly assetAssembler = new AssetAssembler();
  private readonly ioTDeviceAssembler = new IoTDeviceAssembler();
  private readonly sensorAssembler = new SensorAssembler();
  private readonly meterAssembler = new MeterAssembler();
  private assets: AssetResource[] = structuredClone(ASSETS);
  private devices: IoTDeviceResource[] = structuredClone(IOT_DEVICES);

  async listResources(): Promise<Resource[]> {
    return structuredClone(RESOURCES).map((r) => this.resourceAssembler.toEntityFromResource(r));
  }

  async listAssets(): Promise<Asset[]> {
    return structuredClone(this.assets).map((r) => this.assetAssembler.toEntityFromResource(r));
  }

  async listIoTDevices(): Promise<IoTDevice[]> {
    return structuredClone(this.devices).map((r) =>
      this.ioTDeviceAssembler.toEntityFromResource(r),
    );
  }

  async listSensors(): Promise<Sensor[]> {
    return structuredClone(SENSORS).map((r) => this.sensorAssembler.toEntityFromResource(r));
  }

  async listMeters(): Promise<Meter[]> {
    return structuredClone(METERS).map((r) => this.meterAssembler.toEntityFromResource(r));
  }

  async addIoTDevice(device: IoTDevice, asset: Asset): Promise<void> {
    this.assets = [...this.assets, this.assetAssembler.toResourceFromEntity(asset)];
    this.devices = [...this.devices, this.ioTDeviceAssembler.toResourceFromEntity(device)];
  }

  async saveIoTDevice(device: IoTDevice): Promise<void> {
    const record = this.ioTDeviceAssembler.toResourceFromEntity(device);
    this.devices = this.devices.map((r) => (r.id === device.id ? record : r));
  }

  async findIoTDeviceBySerialNumber(serialNumber: string): Promise<IoTDevice | null> {
    const record = this.devices.find((r) => r.serialNumber === serialNumber);
    return record ? this.ioTDeviceAssembler.toEntityFromResource(structuredClone(record)) : null;
  }
}
