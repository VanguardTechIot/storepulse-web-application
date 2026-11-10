import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Callout } from '../../../../shared/presentation/components/callout/callout';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { DeviceRow, ResourceAssetStore } from '../../../application/resource-asset.store';

/** Confirms the deactivation of a device and records its reason. */
@Component({
  selector: 'app-deactivate-device-dialog',
  imports: [
    Callout,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    TranslatePipe,
  ],
  templateUrl: './deactivate-device-dialog.html',
  styleUrl: '../device-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeactivateDeviceDialog {
  private readonly store = inject(ResourceAssetStore);
  private readonly dialogRef = inject(MatDialogRef<DeactivateDeviceDialog, boolean>);
  protected readonly row = inject<DeviceRow>(MAT_DIALOG_DATA);

  protected readonly busy = signal(false);
  protected readonly reason = new FormControl('', { nonNullable: true });

  protected async deactivate(): Promise<void> {
    this.busy.set(true);
    try {
      await this.store.deactivateDevice(this.row.device, this.reason.value);
      this.dialogRef.close(true);
    } finally {
      this.busy.set(false);
    }
  }
}
