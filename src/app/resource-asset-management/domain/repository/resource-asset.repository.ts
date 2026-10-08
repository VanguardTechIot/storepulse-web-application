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
}
