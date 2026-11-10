import { Resource } from '../model/resource.entity';
import { IoTDevice, IoTDeviceType } from '../model/iot-device.entity';

/**
 * Persistence abstraction of the Resource and Asset Management context.
 * Failures arrive as a `ResourceAssetError`.
 */
export interface ResourceAssetRepository {
  listResources(): Promise<Resource[]>;
  listIoTDevices(): Promise<IoTDevice[]>;

  /** Installs a new device on a resource; the serial number must be unique. */
  registerIoTDevice(
    serialNumber: string,
    type: IoTDeviceType,
    resourceId: string,
  ): Promise<IoTDevice>;
  /** Stops data reception of the device. */
  deactivateIoTDevice(deviceId: string, reason: string): Promise<IoTDevice>;
  /** Resumes data reception of an inactive device. */
  reactivateIoTDevice(deviceId: string): Promise<IoTDevice>;
}
