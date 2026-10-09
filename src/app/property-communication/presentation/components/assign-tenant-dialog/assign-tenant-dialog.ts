import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
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
    MatIconModule,
    MatSelectModule,
    ReactiveFormsModule,
    RouterLink,
    TranslatePipe,
  ],
  template: `
    <h2 mat-dialog-title>{{ 'communication.assign.title' | translate }}</h2>
    <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
      <mat-dialog-content>
        <div class="form">
          @if (store.error(); as error) {
            <app-callout type="danger" icon="error" role="alert">{{
              'communication.errors.' + error | translate
            }}</app-callout>
          }
          @if (store.availableUnits().length === 0) {
            <app-callout type="warn" icon="storefront">
              {{ 'communication.assign.no_units' | translate }}
              <a [routerLink]="store.directory.unitsRoute" mat-dialog-close>{{
                'communication.assign.go_to_units' | translate
              }}</a>
            </app-callout>
          }
          <mat-form-field>
            <mat-label>{{ 'communication.fields.tenant' | translate }}</mat-label>
            <mat-select formControlName="tenantId" required>
              @for (tenant of store.directory.tenants(); track tenant.id) {
                <mat-option [value]="tenant.id"
                  >{{ tenant.fullName }} · {{ tenant.email }}</mat-option
                >
              }
            </mat-select>
            <mat-hint>{{ 'communication.assign.tenant_hint' | translate }}</mat-hint>
            @if (form.controls.tenantId.hasError('required')) {
              <mat-error>{{ 'common.validation.required' | translate }}</mat-error>
            }
          </mat-form-field>
          <mat-form-field>
            <mat-label>{{ 'communication.fields.unit' | translate }}</mat-label>
            <mat-select formControlName="unitId" required>
              @for (unit of store.availableUnits(); track unit.id) {
                <mat-option [value]="unit.id">
                  {{ store.directory.unitLabel(unit.id) }} ·
                  {{ 'communication.assign.floor' | translate: { floor: unit.floor } }}
                </mat-option>
              }
            </mat-select>
            @if (form.controls.unitId.hasError('required')) {
              <mat-error>{{ 'common.validation.required' | translate }}</mat-error>
            }
          </mat-form-field>
        </div>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button matButton type="button" mat-dialog-close [disabled]="store.saving()">
          {{ 'common.actions.cancel' | translate }}
        </button>
        <button
          matButton="filled"
          type="submit"
          [disabled]="store.saving() || store.availableUnits().length === 0"
        >
          {{
            (store.saving() ? 'communication.actions.saving' : 'communication.assign.confirm')
              | translate
          }}
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: `
    .form {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding-top: 4px;
    }
    app-callout {
      margin-bottom: 12px;
    }
  `,
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
