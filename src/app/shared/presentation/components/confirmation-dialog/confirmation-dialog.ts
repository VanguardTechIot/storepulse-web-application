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
}

/**
 * Material confirmation shown before a state-changing or irreversible action. Unlike
 * `ConfirmDialog`, it does not depend on the styles of a module, so any view can use it through
 * `confirmAction`.
 */
@Component({
  selector: 'app-confirmation-dialog',
  imports: [MatButtonModule, MatDialogModule, MatIconModule, TranslatePipe],
  template: `
    <h2 mat-dialog-title class="title">
      <mat-icon aria-hidden="true" [class.danger]="data.tone === 'danger'">{{
        data.icon ?? 'help'
      }}</mat-icon>
      {{ data.title }}
    </h2>
    <mat-dialog-content>
      <p class="message">{{ data.message }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button matButton type="button" [mat-dialog-close]="false">
        {{ 'common.actions.cancel' | translate }}
      </button>
      <button
        matButton="filled"
        type="button"
        cdkFocusInitial
        [class.danger-button]="data.tone === 'danger'"
        [mat-dialog-close]="true"
      >
        {{ data.confirmLabel }}
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    .title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 18px;
    }
    .title .mat-icon {
      color: var(--sp-primary);
    }
    .title .mat-icon.danger {
      color: var(--sp-danger);
    }
    .message {
      margin: 0;
      color: var(--sp-text-muted);
      line-height: 1.5;
    }
    .danger-button {
      --mat-button-filled-container-color: var(--sp-danger);
    }
  `,
})
export class ConfirmationDialog {
  protected readonly data = inject<ConfirmationData>(MAT_DIALOG_DATA);
  protected readonly dialogRef = inject(MatDialogRef<ConfirmationDialog, boolean>);
}

/** Opens the confirmation and resolves to `true` only when the user confirms. */
export async function confirmAction(dialog: MatDialog, data: ConfirmationData): Promise<boolean> {
  const ref = dialog.open<ConfirmationDialog, ConfirmationData, boolean>(ConfirmationDialog, {
    data,
    width: '440px',
    autoFocus: false,
  });
  return (await firstValueFrom(ref.afterClosed())) === true;
}
