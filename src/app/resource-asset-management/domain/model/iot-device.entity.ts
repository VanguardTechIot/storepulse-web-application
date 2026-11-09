import { BaseEntity } from '../../../shared/domain/model/base-entity';

/** Node kinds defined in the IoT Device Design: one controller per node. */
export type IoTDeviceType =
  'INTRUSION_NODE' | 'CAMERA_NODE' | 'SMOKE_NODE' | 'CONSUMPTION_NODE' | 'COMMON_AREA_NODE';

export type AssetStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';

export type ConnectivityStatus = 'CONNECTED' | 'DISCONNECTED';

/** Accepted supply voltage range, in volts. */
export const MIN_SUPPLY_VOLTAGE = 4.5;
export const MAX_SUPPLY_VOLTAGE = 5.5;

/**
 * IoT device installed in a resource (stand or common area).
 */
export class IoTDevice implements BaseEntity {
  constructor(
    readonly id: string,
    readonly resourceId: string,
    readonly serialNumber: string,
    readonly manufacturer: string | null,
    readonly firmwareVersion: string | null,
    readonly status: AssetStatus,
    readonly type: IoTDeviceType,
    readonly connectivity: ConnectivityStatus,
    readonly lastReportAt: Date | null,
    readonly supplyVoltage: number | null,
    readonly bufferedEvents: number,
    readonly deactivationReason: string | null,
  ) {}

  get isActive(): boolean {
    return this.status === 'ACTIVE';
  }

  get isDisconnected(): boolean {
    return this.connectivity === 'DISCONNECTED';
  }

  /** A device is faulty when its supply voltage is outside the accepted range. */
  get hasFault(): boolean {
    return (
      this.supplyVoltage !== null &&
      (this.supplyVoltage < MIN_SUPPLY_VOLTAGE || this.supplyVoltage > MAX_SUPPLY_VOLTAGE)
    );
  }
}
