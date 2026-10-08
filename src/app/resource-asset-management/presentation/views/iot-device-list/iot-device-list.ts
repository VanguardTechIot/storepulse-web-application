import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Icon } from '../../../../shared/presentation/components/icon/icon';
import { ViewState } from '../../../../shared/presentation/components/view-state/view-state';
import {
  paginate,
  Paginator,
} from '../../../../shared/presentation/components/paginator/paginator';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { LocalizedDatePipe } from '../../../../shared/presentation/pipes/localized-date.pipe';
import { DeviceFilter, DeviceRow, ResourceAssetStore } from '../../../application/resource-asset.store';
import { IoTDevice } from '../../../domain/model/iot-device.entity';
import { ConfirmDialog } from '../../../../shared/presentation/components/confirm-dialog/confirm-dialog';

type DeviceDisplayStatus = 'ACTIVE' | 'INACTIVE' | 'FAULTY';

const DEVICES_PAGE_SIZE = 8;
const DEVICE_FILTERS: DeviceFilter[] = ['ALL', 'ACTIVE', 'INACTIVE', 'FAULTY', 'DISCONNECTED'];
const STATUS_TONES: Record<DeviceDisplayStatus, string> = {
  ACTIVE: 'badge--success',
  INACTIVE: 'badge--neutral',
  FAULTY: 'badge--violet',
};

/**
 * IoT devices of the gallery with their status, connectivity and supply voltage.
 */
@Component({
  selector: 'app-iot-device-list',
  host: { class: 'monitoring-page' },
  imports: [Icon, ViewState, Paginator, ConfirmDialog, TranslatePipe, LocalizedDatePipe],
  templateUrl: './iot-device-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IoTDeviceList {
  protected readonly store = inject(ResourceAssetStore);

  protected readonly filters = DEVICE_FILTERS;
  protected readonly pageSize = DEVICES_PAGE_SIZE;
  protected readonly page = signal(1);
  protected readonly pagedRows = computed(() =>
    paginate(this.store.filteredRows(), this.page(), DEVICES_PAGE_SIZE),
  );
  protected readonly rowToDeactivate = signal<DeviceRow | null>(null);
  protected readonly deactivationReason = signal('');
  protected readonly busy = signal(false);

  constructor() {
    void this.store.load();
  }

  protected setFilter(filter: DeviceFilter): void {
    this.page.set(1);
    this.store.filter.set(filter);
  }

  protected setSearch(value: string): void {
    this.page.set(1);
    this.store.searchTerm.set(value);
  }

  protected statusOf(device: IoTDevice): DeviceDisplayStatus {
    if (!device.isActive) return 'INACTIVE';
    return device.hasFault ? 'FAULTY' : 'ACTIVE';
  }

  protected toneOf(device: IoTDevice): string {
    return STATUS_TONES[this.statusOf(device)];
  }

  protected openDeactivation(row: DeviceRow): void {
    this.deactivationReason.set('');
    this.rowToDeactivate.set(row);
  }

  protected closeDeactivation(): void {
    this.rowToDeactivate.set(null);
  }

  protected async confirmDeactivation(): Promise<void> {
    const row = this.rowToDeactivate();
    if (!row) return;
    this.busy.set(true);
    try {
      await this.store.deactivateDevice(row.device, this.deactivationReason());
      this.closeDeactivation();
    } finally {
      this.busy.set(false);
    }
  }

  protected async reactivate(row: DeviceRow): Promise<void> {
    this.busy.set(true);
    try {
      await this.store.reactivateDevice(row.device);
    } finally {
      this.busy.set(false);
    }
  }
}
