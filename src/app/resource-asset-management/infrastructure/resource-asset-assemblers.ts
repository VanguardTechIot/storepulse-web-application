import { Resource } from '../domain/model/resource.entity';
import { IoTDevice } from '../domain/model/iot-device.entity';
import { IoTDeviceResource, ResourceResource } from './resource-asset-responses';

export class ResourceAssembler {
  toEntityFromResource(r: ResourceResource): Resource {
    const location = { address: r.address, floor: r.floor, reference: r.reference };
    return new Resource(String(r.id), r.name, r.description, location, r.status);
  }
}

export class IoTDeviceAssembler {
  toEntityFromResource(r: IoTDeviceResource): IoTDevice {
    return new IoTDevice(
      String(r.id),
      String(r.resourceId),
      r.serialNumber,
      r.manufacturer,
      r.firmwareVersion,
      r.status,
      r.type,
      r.connectivity,
      r.lastReportAt ? new Date(r.lastReportAt) : null,
      r.supplyVoltage,
      r.bufferedEvents,
      r.deactivationReason,
    );
  }
}
