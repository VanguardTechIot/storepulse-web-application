/**
 * Business outcomes that prevent a device operation from completing.
 * The value is the code answered by the platform API.
 */
export enum ResourceAssetErrorCode {
  SerialNumberAlreadyRegistered = 'serial_number_already_registered',
  ResourceNotFound = 'resource_not_found',
  IoTDeviceNotFound = 'iot_device_not_found',
  IoTDeviceAlreadyInactive = 'iot_device_already_inactive',
  IoTDeviceAlreadyActive = 'iot_device_already_active',
  Network = 'network',
  Unexpected = 'unexpected',
}

export class ResourceAssetError extends Error {
  constructor(readonly code: ResourceAssetErrorCode) {
    super(code);
    this.name = 'ResourceAssetError';
  }
}
