import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { Resource } from '../domain/model/resource.entity';
import { Asset } from '../domain/model/asset.entity';
import { IoTDevice } from '../domain/model/iot-device.entity';
import { Sensor } from '../domain/model/sensor.entity';
import { Meter } from '../domain/model/meter.entity';
import {
  AssetResource,
  IoTDeviceResource,
  MeterResource,
  ResourceResource,
  SensorResource,
} from './resource-asset-responses';

export class ResourceAssembler implements BaseAssembler<Resource, ResourceResource> {
  toEntityFromResource(r: ResourceResource): Resource {
    return new Resource(r.id, r.name, r.description, r.location, r.status);
  }

  toResourceFromEntity(e: Resource): ResourceResource {
    return { id: e.id, name: e.name, description: e.description, location: e.location, status: e.status };
  }
}

export class AssetAssembler implements BaseAssembler<Asset, AssetResource> {
  toEntityFromResource(r: AssetResource): Asset {
    return new Asset(r.id, r.name, r.type, r.status, r.resourceId);
  }

  toResourceFromEntity(e: Asset): AssetResource {
    return { id: e.id, name: e.name, type: e.type, status: e.status, resourceId: e.resourceId };
  }
}

export class IoTDeviceAssembler implements BaseAssembler<IoTDevice, IoTDeviceResource> {
  toEntityFromResource(r: IoTDeviceResource): IoTDevice {
    return new IoTDevice(r.id, r.assetId, r.serialNumber, r.manufacturer, r.firmwareVersion, r.status);
  }

  toResourceFromEntity(e: IoTDevice): IoTDeviceResource {
    return {
      id: e.id,
      assetId: e.assetId,
      serialNumber: e.serialNumber,
      manufacturer: e.manufacturer,
      firmwareVersion: e.firmwareVersion,
      status: e.status,
    };
  }
}

export class SensorAssembler implements BaseAssembler<Sensor, SensorResource> {
  toEntityFromResource(r: SensorResource): Sensor {
    return new Sensor(r.id, r.iotDeviceId, r.type, r.unit, r.status);
  }

  toResourceFromEntity(e: Sensor): SensorResource {
    return { id: e.id, iotDeviceId: e.iotDeviceId, type: e.type, unit: e.unit, status: e.status };
  }
}

export class MeterAssembler implements BaseAssembler<Meter, MeterResource> {
  toEntityFromResource(r: MeterResource): Meter {
    return new Meter(r.id, r.iotDeviceId, r.type, r.unit, r.status);
  }

  toResourceFromEntity(e: Meter): MeterResource {
    return { id: e.id, iotDeviceId: e.iotDeviceId, type: e.type, unit: e.unit, status: e.status };
  }
}
