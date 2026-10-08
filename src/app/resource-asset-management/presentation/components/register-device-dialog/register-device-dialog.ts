import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { ConfirmDialog } from '../../../../shared/presentation/components/confirm-dialog/confirm-dialog';
import { Icon } from '../../../../shared/presentation/components/icon/icon';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { ResourceAssetStore } from '../../../application/resource-asset.store';
import { IoTDeviceType } from '../../../domain/model/iot-device.entity';

const DEVICE_TYPES: IoTDeviceType[] = [
  'INTRUSION_NODE',
  'CAMERA_NODE',
  'SMOKE_NODE',
  'CONSUMPTION_NODE',
  'COMMON_AREA_NODE',
];

/**
 * Form to register an IoT device and link it to a stand or common area (US-14).
 */
@Component({
  selector: 'app-register-device-dialog',
  imports: [ConfirmDialog, Icon, TranslatePipe],
  templateUrl: './register-device-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterDeviceDialog {
  protected readonly store = inject(ResourceAssetStore);

  readonly open = input(false);
  readonly closed = output<void>();

  protected readonly types = DEVICE_TYPES;
  protected readonly serialNumber = signal('');
  protected readonly type = signal<IoTDeviceType>('INTRUSION_NODE');
  protected readonly resourceId = signal('');
  protected readonly submitted = signal(false);
  protected readonly duplicated = signal(false);
  protected readonly busy = signal(false);

  protected readonly serialMissing = computed(
    () => this.submitted() && !this.serialNumber().trim(),
  );
  protected readonly resourceMissing = computed(() => this.submitted() && !this.resourceId());

  protected setSerialNumber(value: string): void {
    this.duplicated.set(false);
    this.serialNumber.set(value);
  }

  protected setType(value: string): void {
    this.type.set(value as IoTDeviceType);
  }

  protected async register(): Promise<void> {
    this.submitted.set(true);
    if (!this.serialNumber().trim() || !this.resourceId()) return;
    this.busy.set(true);
    try {
      const outcome = await this.store.registerDevice(
        this.serialNumber(),
        this.type(),
        this.resourceId(),
      );
      if (outcome === 'duplicated') {
        this.duplicated.set(true);
        return;
      }
      this.close();
    } finally {
      this.busy.set(false);
    }
  }

  protected close(): void {
    this.serialNumber.set('');
    this.type.set('INTRUSION_NODE');
    this.resourceId.set('');
    this.submitted.set(false);
    this.duplicated.set(false);
    this.closed.emit();
  }
}
