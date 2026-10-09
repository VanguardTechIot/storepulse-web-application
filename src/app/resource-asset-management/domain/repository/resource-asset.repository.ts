import { Resource } from '../model/resource.entity';
import { Asset } from '../model/asset.entity';
import { IoTDevice } from '../model/iot-device.entity';
import { Sensor } from '../model/sensor.entity';
import { Meter } from '../model/meter.entity';

/** Abstracción de persistencia del contexto Resource and Asset Management. */
export interface ResourceAssetRepository {
  listResources(): Promise<Resource[]>;
  listAssets(): Promise<Asset[]>;
  listIoTDevices(): Promise<IoTDevice[]>;
  listSensors(): Promise<Sensor[]>;
  listMeters(): Promise<Meter[]>;

  /** Registra un dispositivo nuevo junto con el asset que lo vincula a un resource. */
  addIoTDevice(device: IoTDevice, asset: Asset): Promise<void>;
  /** Guarda los cambios de un dispositivo existente (desactivar, reactivar). */
  saveIoTDevice(device: IoTDevice): Promise<void>;
  findIoTDeviceBySerialNumber(serialNumber: string): Promise<IoTDevice | null>;
}
