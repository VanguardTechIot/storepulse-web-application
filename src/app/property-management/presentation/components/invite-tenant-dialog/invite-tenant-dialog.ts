import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Callout } from '../../../../shared/presentation/components/callout/callout';
import { LocalizedDatePipe } from '../../../../shared/presentation/pipes/localized-date.pipe';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { PropertyManagementStore } from '../../../application/property-management.store';
import { CommercialUnit } from '../../../domain/model/commercial-unit.entity';
import { InviteTenantCommand } from '../../../domain/model/invite-tenant.command';
import { TenantInvitation } from '../../../domain/model/tenant-invitation.entity';
import { invitationEmailValidator } from '../../property.validators';

/**
 * Invites the tenant of a store without tenant to sign up linked to it. A link still
 * pending for the store is invalidated when the new one is sent.
 */
@Component({
  selector: 'app-invite-tenant-dialog',
  imports: [
    Callout,
    LocalizedDatePipe,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    ReactiveFormsModule,
    TranslatePipe,
  ],
  templateUrl: './invite-tenant-dialog.html',
  styleUrl: './invite-tenant-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InviteTenantDialog {
  protected readonly store = inject(PropertyManagementStore);
  protected readonly unit = inject<CommercialUnit>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<InviteTenantDialog, boolean>);

  protected readonly validityDays = TenantInvitation.validityDays;
  protected readonly pending = this.store.pendingInvitationOf(this.unit.id);
  protected readonly form = new FormGroup({
    email: new FormControl(this.pending?.email ?? '', {
      nonNullable: true,
      validators: [Validators.required, invitationEmailValidator],
    }),
  });
  protected readonly email = this.form.controls.email;

  constructor() {
    this.store.clearError();
  }

  protected async submit(): Promise<void> {
    if (this.email.invalid) {
      this.email.markAsTouched();
      return;
    }
    const command = new InviteTenantCommand({ unitId: this.unit.id, email: this.email.value });
    if (await this.store.inviteTenant(command)) this.dialogRef.close(true);
  }
}
