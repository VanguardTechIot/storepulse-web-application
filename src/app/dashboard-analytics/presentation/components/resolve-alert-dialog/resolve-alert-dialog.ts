import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { firstValueFrom } from 'rxjs';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { RESOLUTION_NOTE_MAX_LENGTH } from '../../../domain/model/alert.entity';

/** Asks for the note that explains how an acknowledged alert was resolved. */
@Component({
  selector: 'app-resolve-alert-dialog',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    TranslatePipe,
  ],
  templateUrl: './resolve-alert-dialog.html',
  styleUrls: [
    '../../../../shared/presentation/styles/storepulse-theme.css',
    './resolve-alert-dialog.css',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResolveAlertDialog {
  private readonly dialogRef = inject(MatDialogRef<ResolveAlertDialog, string>);

  protected readonly maxLength = RESOLUTION_NOTE_MAX_LENGTH;
  protected readonly note = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.pattern(/\S/)],
  });

  protected confirm(): void {
    if (this.note.invalid) {
      this.note.markAsTouched();
      return;
    }
    this.dialogRef.close(this.note.value.trim());
  }
}

/** Opens the dialog and resolves to the note, or `null` when the user cancels. */
export async function askResolutionNote(dialog: MatDialog, id: string): Promise<string | null> {
  const ref = dialog.open<ResolveAlertDialog, void, string>(ResolveAlertDialog, {
    id,
    width: '480px',
    autoFocus: false,
  });
  return (await firstValueFrom(ref.afterClosed())) ?? null;
}
