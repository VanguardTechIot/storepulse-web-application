import { computed, inject, Injectable, signal } from '@angular/core';
import { RESOURCE_ASSET_REPOSITORY } from '../infrastructure/resource-asset.token';
import { Resource } from '../domain/model/resource.entity';
import { Asset } from '../domain/model/asset.entity';
import { IoTDevice, IoTDeviceType } from '../domain/model/iot-device.entity';

/** IoT device joined with the resource (stand or common area) where it is installed. */
export interface DeviceRow {
  device: IoTDevice;
  resource: Resource | null;
}

export type DeviceFilter = 'ALL' | 'ACTIVE' | 'INACTIVE' | 'FAULTY' | 'DISCONNECTED';

/** Result of a registration attempt (US-14). */
export type RegisterDeviceOutcome = 'registered' | 'duplicated';

type LoadStatus = 'idle' | 'loading' | 'loaded' | 'error';

const DEFAULT_MANUFACTURER = 'Espressif Systems';
const DEFAULT_FIRMWARE_VERSION = '1.4.2';

/**
 * Application service of Resource and Asset Management for the Web Application.
 */
@Injectable({ providedIn: 'root' })
export class ResourceAssetStore {
  private readonly repository = inject(RESOURCE_ASSET_REPOSITORY);

  private readonly status = signal<LoadStatus>('idle');
  readonly isLoading = computed(() => this.status() === 'loading' || this.status() === 'idle');
  readonly hasError = computed(() => this.status() === 'error');

  readonly resources = signal<Resource[]>([]);
  readonly assets = signal<Asset[]>([]);
  readonly devices = signal<IoTDevice[]>([]);

  readonly filter = signal<DeviceFilter>('ALL');
  readonly searchTerm = signal('');

  // ---------- Device list ----------
  /** Every device with its location; disconnected devices first (US-40). */
  readonly deviceRows = computed<DeviceRow[]>(() => {
    const resourceById = new Map(this.resources().map((r) => [r.id, r]));
    const assetById = new Map(this.assets().map((a) => [a.id, a]));
    return this.devices()
      .map((device) => {
        const asset = assetById.get(device.assetId);
        return { device, resource: asset ? (resourceById.get(asset.resourceId) ?? null) : null };
      })
      .sort((a, b) => Number(b.device.isDisconnected) - Number(a.device.isDisconnected));
  });

  readonly filteredRows = computed<DeviceRow[]>(() => {
    const term = this.searchTerm().trim().toLowerCase();
    return this.deviceRows().filter(({ device, resource }) => {
      const matchesTerm =
        !term ||
        device.serialNumber.toLowerCase().includes(term) ||
        (resource?.name.toLowerCase().includes(term) ?? false);
      return matchesTerm && this.matchesFilter(device);
    });
  });

  // ---------- Summary ----------
  readonly registeredCount = computed(() => this.devices().length);
  readonly activeCount = computed(() => this.devices().filter((d) => d.isActive).length);
  readonly inactiveCount = computed(() => this.devices().filter((d) => !d.isActive).length);
  readonly disconnectedCount = computed(
    () => this.devices().filter((d) => d.isDisconnected).length,
  );
  readonly faultyCount = computed(() => this.devices().filter((d) => d.hasFault).length);
  readonly bufferedEventCount = computed(() =>
    this.devices().reduce((total, d) => total + d.bufferedEvents, 0),
  );

  // ---------- Actions ----------
  async load(): Promise<void> {
    this.status.set('loading');
    try {
      const [resources, assets, devices] = await Promise.all([
        this.repository.listResources(),
        this.repository.listAssets(),
        this.repository.listIoTDevices(),
      ]);
      this.resources.set(resources);
      this.assets.set(assets);
      this.devices.set(devices);
      this.status.set('loaded');
    } catch {
      this.status.set('error');
    }
  }

  /** Registers a device and links it to a resource; the serial number must be unique (US-14). */
  async registerDevice(
    serialNumber: string,
    type: IoTDeviceType,
    resourceId: string,
  ): Promise<RegisterDeviceOutcome> {
    const serial = serialNumber.trim().toUpperCase();
    if (await this.repository.findIoTDeviceBySerialNumber(serial)) return 'duplicated';

    const resource = this.resources().find((r) => r.id === resourceId);
    const suffix = Date.now().toString();
    const asset = new Asset(
      `ast-${suffix}`,
      `Nodo IoT ${resource?.name ?? ''}`.trim(),
      'IOT_DEVICE',
      'ACTIVE',
      resourceId,
    );
    const device = new IoTDevice(
      `dev-${suffix}`,
      asset.id,
      serial,
      DEFAULT_MANUFACTURER,
      DEFAULT_FIRMWARE_VERSION,
      'ACTIVE',
      type,
      'CONNECTED',
      new Date().toISOString(),
    );
    await this.repository.addIoTDevice(device, asset);
    await this.load();
    return 'registered';
  }

  /** Stops data reception of a device (US-16). */
  async deactivateDevice(device: IoTDevice, reason: string): Promise<void> {
    await this.repository.saveIoTDevice(device.deactivate(reason.trim()));
    await this.load();
  }

  /** Resumes data reception of an inactive device (US-17). */
  async reactivateDevice(device: IoTDevice): Promise<void> {
    await this.repository.saveIoTDevice(device.reactivate());
    await this.load();
  }

  private matchesFilter(device: IoTDevice): boolean {
    switch (this.filter()) {
      case 'ACTIVE':
        return device.isActive;
      case 'INACTIVE':
        return !device.isActive;
      case 'FAULTY':
        return device.hasFault;
      case 'DISCONNECTED':
        return device.isDisconnected;
      default:
        return true;
    }
  }
}
