import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { firstValueFrom } from 'rxjs';
import { TranslatePipe } from '../../pipes/translate.pipe';

export interface ConfirmationData {
  title: string;
  message: string;
  confirmLabel: string;
  tone?: 'primary' | 'danger';
  icon?: string;
  /** Id of the dialog element. */
  id?: string;
}

/**
 * Material confirmation shown before a state-changing or irreversible action. Unlike
 * `ConfirmDialog`, it does not depend on the styles of a module, so any view can use it through
 * `confirmAction`.
 */
@Component({
  selector: 'app-confirmation-dialog',
  imports: [MatButtonModule, MatDialogModule, MatIconModule, TranslatePipe],
  templateUrl: './confirmation-dialog.html',
  styleUrls: ['../../styles/storepulse-theme.css', './confirmation-dialog.css'],
})
export class ConfirmationDialog {
  protected readonly data = inject<ConfirmationData>(MAT_DIALOG_DATA);
  protected readonly dialogRef = inject(MatDialogRef<ConfirmationDialog, boolean>);
}

/** Opens the confirmation and resolves to `true` only when the user confirms. */
export async function confirmAction(dialog: MatDialog, data: ConfirmationData): Promise<boolean> {
  const ref = dialog.open<ConfirmationDialog, ConfirmationData, boolean>(ConfirmationDialog, {
    id: data.id,
    data,
    width: '440px',
    autoFocus: false,
  });
  return (await firstValueFrom(ref.afterClosed())) === true;
}
