import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Callout } from '../../../../shared/presentation/components/callout/callout';
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

/** Registers an IoT device and links it to a stand or common area. */
@Component({
  selector: 'app-register-device-dialog',
  imports: [
    Callout,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    TranslatePipe,
  ],
  templateUrl: './register-device-dialog.html',
  styleUrl: '../device-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterDeviceDialog {
  protected readonly store = inject(ResourceAssetStore);
  private readonly dialogRef = inject(MatDialogRef<RegisterDeviceDialog, boolean>);

  protected readonly types = DEVICE_TYPES;
  protected readonly busy = signal(false);
  /** Serial number already registered, shown until the field changes. */
  protected readonly duplicated = signal<string | null>(null);
  protected readonly form = new FormGroup({
    serialNumber: new FormControl('', { nonNullable: true, validators: Validators.required }),
    type: new FormControl<IoTDeviceType>('INTRUSION_NODE', { nonNullable: true }),
    resourceId: new FormControl('', { nonNullable: true, validators: Validators.required }),
  });

  constructor() {
    this.form.controls.serialNumber.valueChanges.subscribe(() => this.duplicated.set(null));
  }

  protected async register(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { serialNumber, type, resourceId } = this.form.getRawValue();
    this.busy.set(true);
    try {
      const outcome = await this.store.registerDevice(serialNumber, type, resourceId);
      if (outcome === 'duplicated') this.duplicated.set(serialNumber.trim().toUpperCase());
      else this.dialogRef.close(true);
    } finally {
      this.busy.set(false);
    }
  }
}
