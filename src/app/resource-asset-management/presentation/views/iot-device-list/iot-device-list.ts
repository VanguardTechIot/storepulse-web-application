import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { Callout } from '../../../../shared/presentation/components/callout/callout';
import { KpiCard } from '../../../../shared/presentation/components/kpi-card/kpi-card';
import { PageState } from '../../../../shared/presentation/components/page-state/page-state';
import { StatusChip } from '../../../../shared/presentation/components/status-chip/status-chip';
import { Tone } from '../../../../shared/presentation/components/tone-icon/tone-icon';
import { LocalizedDatePipe } from '../../../../shared/presentation/pipes/localized-date.pipe';
import { LocalizedNumberPipe } from '../../../../shared/presentation/pipes/localized-number.pipe';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import {
  DeviceFilter,
  DeviceRow,
  ResourceAssetStore,
} from '../../../application/resource-asset.store';
import { IoTDevice } from '../../../domain/model/iot-device.entity';
import { DeactivateDeviceDialog } from '../../components/deactivate-device-dialog/deactivate-device-dialog';
import { RegisterDeviceDialog } from '../../components/register-device-dialog/register-device-dialog';

type DeviceDisplayStatus = 'ACTIVE' | 'INACTIVE' | 'FAULTY';

const STATUS_TONES: Record<DeviceDisplayStatus, Tone> = {
  ACTIVE: 'success',
  INACTIVE: 'neutral',
  FAULTY: 'violet',
};

/** IoT devices of the gallery with their status, connectivity and supply voltage. */
@Component({
  selector: 'app-iot-device-list',
  imports: [
    Callout,
    KpiCard,
    LocalizedDatePipe,
    LocalizedNumberPipe,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatTableModule,
    PageState,
    StatusChip,
    TranslatePipe,
  ],
  templateUrl: './iot-device-list.html',
  styleUrls: [
    '../../../../shared/presentation/styles/storepulse-theme.css',
    '../../../../shared/presentation/styles/page.css',
    './iot-device-list.css',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IoTDeviceList {
  protected readonly store = inject(ResourceAssetStore);
  private readonly dialog = inject(MatDialog);

  protected readonly filters: DeviceFilter[] = [
    'ALL',
    'ACTIVE',
    'INACTIVE',
    'FAULTY',
    'DISCONNECTED',
  ];
  protected readonly columns = ['device', 'stand', 'status', 'connectivity', 'voltage', 'action'];
  protected readonly pageSize = 8;
  protected readonly pageIndex = signal(0);
  protected readonly pagedRows = computed(() => {
    const start = this.pageIndex() * this.pageSize;
    return this.store.filteredRows().slice(start, start + this.pageSize);
  });
  protected readonly busy = signal(false);

  constructor() {
    void this.store.load();
  }

  protected setFilter(filter: DeviceFilter): void {
    this.pageIndex.set(0);
    this.store.filter.set(filter);
  }

  protected setSearch(value: string): void {
    this.pageIndex.set(0);
    this.store.searchTerm.set(value);
  }

  protected statusOf(device: IoTDevice): DeviceDisplayStatus {
    if (!device.isActive) return 'INACTIVE';
    return device.hasFault ? 'FAULTY' : 'ACTIVE';
  }

  protected statusTone(device: IoTDevice): Tone {
    return STATUS_TONES[this.statusOf(device)];
  }

  protected register(): void {
    this.dialog.open(RegisterDeviceDialog, { id: 'register-dialog', width: '520px' });
  }

  protected deactivate(row: DeviceRow): void {
    this.dialog.open(DeactivateDeviceDialog, {
      id: 'deactivate-dialog',
      width: '480px',
      data: row,
    });
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
