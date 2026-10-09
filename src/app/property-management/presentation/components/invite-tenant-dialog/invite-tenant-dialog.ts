import { Component, inject } from '@angular/core';
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
 * Invites the tenant of a store without tenant to sign up linked to it (US-12). A link still
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
  template: `
    <h2 mat-dialog-title>{{ 'property.invite.title' | translate: { unit: unit.code } }}</h2>
    <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
      <mat-dialog-content>
        <div class="body">
          <p class="lead">{{ 'property.invite.lead' | translate: { days: validityDays } }}</p>
          @if (store.error(); as error) {
            <app-callout type="danger" icon="error" role="alert">{{
              'property.errors.' + error | translate
            }}</app-callout>
          }
          @if (pending; as invitation) {
            <app-callout type="warn" icon="schedule">
              {{
                'property.invite.pending_notice'
                  | translate
                    : {
                        email: invitation.email,
                        date: (invitation.expiresAt | localizedDate: 'date'),
                      }
              }}
            </app-callout>
          }
          <mat-form-field>
            <mat-label>{{ 'property.fields.tenant_email' | translate }}</mat-label>
            <mat-icon matPrefix aria-hidden="true">mail</mat-icon>
            <input
              matInput
              type="email"
              formControlName="email"
              autocomplete="email"
              required
              cdkFocusInitial
            />
            @if (email.hasError('required')) {
              <mat-error>{{ 'common.validation.required' | translate }}</mat-error>
            } @else if (email.hasError('email')) {
              <mat-error>{{ 'common.validation.email' | translate }}</mat-error>
            }
          </mat-form-field>
        </div>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button matButton type="button" mat-dialog-close [disabled]="store.saving()">
          {{ 'common.actions.cancel' | translate }}
        </button>
        <button matButton="filled" type="submit" [disabled]="store.saving()">
          <mat-icon aria-hidden="true">send</mat-icon>
          {{ (store.saving() ? 'property.invite.sending' : 'property.invite.send') | translate }}
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: `
    .body {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding-top: 4px;
    }
    .lead {
      margin: 0;
      color: var(--sp-text-muted);
      line-height: 1.5;
    }
  `,
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
