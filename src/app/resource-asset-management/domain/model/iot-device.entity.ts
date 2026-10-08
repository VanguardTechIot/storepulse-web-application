import { BaseEntity } from '../../../shared/domain/model/base-entity';
import { AssetStatus } from './asset.entity';

/** Node kinds defined in the IoT Device Design: one controller per node. */
export type IoTDeviceType =
  | 'INTRUSION_NODE'
  | 'CAMERA_NODE'
  | 'SMOKE_NODE'
  | 'CONSUMPTION_NODE'
  | 'COMMON_AREA_NODE';

export type ConnectivityStatus = 'CONNECTED' | 'DISCONNECTED';

/** Accepted supply voltage range, in volts. */
export const MIN_SUPPLY_VOLTAGE = 4.5;
export const MAX_SUPPLY_VOLTAGE = 5.5;

/**
 * IoT device represented by an asset.
 */
export class IoTDevice implements BaseEntity {
  constructor(
    readonly id: string,
    readonly assetId: string,
    readonly serialNumber: string,
    readonly manufacturer: string,
    readonly firmwareVersion: string,
    readonly status: AssetStatus,
    readonly type: IoTDeviceType = 'INTRUSION_NODE',
    readonly connectivity: ConnectivityStatus = 'CONNECTED',
    readonly lastReportAt: string | null = null,
    readonly supplyVoltage: number | null = null,
    readonly bufferedEvents: number = 0,
    readonly deactivationReason: string | null = null,
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
