import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Callout } from '../../../../shared/presentation/components/callout/callout';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { PropertyManagementStore } from '../../../application/property-management.store';
import { CommercialUnit } from '../../../domain/model/commercial-unit.entity';
import { RegisterCommercialUnitCommand } from '../../../domain/model/register-commercial-unit.command';
import { UnitType } from '../../../domain/model/unit-type.enum';
import { UpdateCommercialUnitCommand } from '../../../domain/model/update-commercial-unit.command';
import { areaValidator, notBlankValidator } from '../../property.validators';

export interface UnitFormData {
  /** Unit to edit; omitted to register a new one. */
  unit?: CommercialUnit;
  /** Kind preselected for a new unit. */
  type?: UnitType;
}

/**
 * Registers a store (US-09) or a common area (US-57), or edits a unit (US-10). A duplicated number
 * or name is reported and nothing is saved.
 */
@Component({
  selector: 'app-unit-form-dialog',
  imports: [
    Callout,
    MatButtonModule,
    MatButtonToggleModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    ReactiveFormsModule,
    TranslatePipe,
  ],
  templateUrl: './unit-form-dialog.html',
  styles: `
    .form {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding-top: 4px;
    }
    .type {
      margin-bottom: 16px;
    }
    .row {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0 16px;
    }
    app-callout {
      margin-bottom: 12px;
    }
    @media (max-width: 559.98px) {
      .row {
        grid-template-columns: minmax(0, 1fr);
      }
    }
  `,
})
export class UnitFormDialog {
  protected readonly store = inject(PropertyManagementStore);
  protected readonly data = inject<UnitFormData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<UnitFormDialog, boolean>);

  protected readonly UnitType = UnitType;
  protected readonly editing = this.data.unit ?? null;
  protected readonly businessNameMaxLength = CommercialUnit.businessNameMaxLength;
  protected readonly floorMaxLength = CommercialUnit.floorMaxLength;

  protected readonly form = new FormGroup({
    type: new FormControl<UnitType>(this.editing?.type ?? this.data.type ?? UnitType.Store, {
      nonNullable: true,
    }),
    code: new FormControl(this.editing?.code ?? '', {
      nonNullable: true,
      validators: [Validators.required, notBlankValidator],
    }),
    floor: new FormControl(this.editing?.floor ?? '', {
      nonNullable: true,
      validators: [
        Validators.required,
        notBlankValidator,
        Validators.maxLength(CommercialUnit.floorMaxLength),
      ],
    }),
    areaSquareMeters: new FormControl<number | null>(this.editing?.areaSquareMeters ?? null, {
      validators: [Validators.required, areaValidator],
    }),
    businessName: new FormControl(this.editing?.businessName ?? '', {
      nonNullable: true,
      validators: [Validators.maxLength(CommercialUnit.businessNameMaxLength)],
    }),
  });

  constructor() {
    this.store.clearError();
  }

  protected get isStore(): boolean {
    return this.form.controls.type.value === UnitType.Store;
  }

  protected get codeMaxLength(): number {
    return this.isStore
      ? CommercialUnit.storeCodeMaxLength
      : CommercialUnit.commonAreaNameMaxLength;
  }

  protected async submit(): Promise<void> {
    const { type, code, floor, areaSquareMeters, businessName } = this.form.getRawValue();
    if (code.trim().length > this.codeMaxLength) {
      this.form.controls.code.setErrors({ maxlength: true });
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const data = {
      code,
      floor,
      areaSquareMeters: Number(areaSquareMeters),
      businessName: type === UnitType.Store ? businessName : null,
    };
    const ok = this.editing
      ? await this.store.updateUnit(this.editing.id, new UpdateCommercialUnitCommand(data))
      : await this.store.registerUnit(new RegisterCommercialUnitCommand({ type, ...data }));
    if (ok) this.dialogRef.close(true);
  }
}
