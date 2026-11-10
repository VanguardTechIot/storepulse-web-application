import { computed, inject, Injectable, signal } from '@angular/core';
import { RESOURCE_ASSET_REPOSITORY } from '../infrastructure/resource-asset.token';
import { Resource } from '../domain/model/resource.entity';
import { IoTDevice, IoTDeviceType } from '../domain/model/iot-device.entity';
import { ResourceAssetError, ResourceAssetErrorCode } from '../domain/model/resource-asset-error';

/** IoT device joined with the resource (stand or common area) where it is installed. */
export interface DeviceRow {
  device: IoTDevice;
  resource: Resource | null;
}

export type DeviceFilter = 'ALL' | 'ACTIVE' | 'INACTIVE' | 'FAULTY' | 'DISCONNECTED';

/** Result of a registration attempt. */
export type RegisterDeviceOutcome = 'registered' | 'duplicated' | 'unlinked';

type LoadStatus = 'idle' | 'loading' | 'loaded' | 'error';

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
  readonly devices = signal<IoTDevice[]>([]);

  readonly filter = signal<DeviceFilter>('ALL');
  readonly searchTerm = signal('');

  // ---------- Device list ----------
  /** Every device with its location; disconnected devices first. */
  readonly deviceRows = computed<DeviceRow[]>(() => {
    const resourceById = new Map(this.resources().map((r) => [r.id, r]));
    return this.devices()
      .map((device) => ({ device, resource: resourceById.get(device.resourceId) ?? null }))
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
      const [resources, devices] = await Promise.all([
        this.repository.listResources(),
        this.repository.listIoTDevices(),
      ]);
      this.resources.set(resources);
      this.devices.set(devices);
      this.status.set('loaded');
    } catch {
      this.status.set('error');
    }
  }

  /**
   * Registers a device and links it to a resource; the serial number must be unique and the
   * resource must be linked to a unit of the gallery.
   */
  async registerDevice(
    serialNumber: string,
    type: IoTDeviceType,
    resourceId: string,
  ): Promise<RegisterDeviceOutcome> {
    try {
      await this.repository.registerIoTDevice(serialNumber.trim().toUpperCase(), type, resourceId);
    } catch (error) {
      if (error instanceof ResourceAssetError) {
        if (error.code === ResourceAssetErrorCode.SerialNumberAlreadyRegistered)
          return 'duplicated';
        if (error.code === ResourceAssetErrorCode.ResourceNotFound) return 'unlinked';
      }
      throw error;
    }
    await this.load();
    return 'registered';
  }

  /** Stops data reception of a device. */
  async deactivateDevice(device: IoTDevice, reason: string): Promise<void> {
    await this.repository.deactivateIoTDevice(device.id, reason.trim());
    await this.load();
  }

  /** Resumes data reception of an inactive device. */
  async reactivateDevice(device: IoTDevice): Promise<void> {
    await this.repository.reactivateIoTDevice(device.id);
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
