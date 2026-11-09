import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { RouterLink } from '@angular/router';
import { Callout } from '../../../../shared/presentation/components/callout/callout';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { TenantAssignmentsStore } from '../../../application/tenant-assignments.store';

/** Assigns a registered tenant to a free store; the store becomes occupied. */
@Component({
  selector: 'app-assign-tenant-dialog',
  imports: [
    Callout,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    ReactiveFormsModule,
    RouterLink,
    TranslatePipe,
  ],
  templateUrl: './assign-tenant-dialog.html',
  styleUrl: './assign-tenant-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssignTenantDialog {
  protected readonly store = inject(TenantAssignmentsStore);
  private readonly dialogRef = inject(MatDialogRef<AssignTenantDialog, boolean>);

  protected readonly form = new FormGroup({
    tenantId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    unitId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  constructor() {
    this.store.clearError();
  }

  protected async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { tenantId, unitId } = this.form.getRawValue();
    if (await this.store.assign(tenantId, unitId)) this.dialogRef.close(true);
  }
}
