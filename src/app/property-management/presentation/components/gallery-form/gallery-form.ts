import { Component, effect, inject, input, output, untracked } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Callout } from '../../../../shared/presentation/components/callout/callout';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { PropertyManagementStore } from '../../../application/property-management.store';
import { CommercialGallery } from '../../../domain/model/commercial-gallery.entity';
import { RegisterCommercialGalleryCommand } from '../../../domain/model/register-commercial-gallery.command';
import { UpdateCommercialGalleryInfoCommand } from '../../../domain/model/update-commercial-gallery-info.command';
import { notBlankValidator } from '../../property.validators';

/**
 * Registers the gallery (US-08) or edits its general data. Missing fields are marked and nothing
 * is saved (US-08, scenario 2).
 */
@Component({
  selector: 'app-gallery-form',
  imports: [
    Callout,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    ReactiveFormsModule,
    TranslatePipe,
  ],
  templateUrl: './gallery-form.html',
  styleUrl: './gallery-form.css',
})
export class GalleryForm {
  protected readonly store = inject(PropertyManagementStore);

  /** Gallery to edit; `null` registers a new one. */
  readonly gallery = input<CommercialGallery | null>(null);
  readonly saved = output<void>();

  protected readonly nameMaxLength = CommercialGallery.nameMaxLength;
  protected readonly addressMaxLength = CommercialGallery.addressMaxLength;
  protected readonly maxTotalUnits = CommercialGallery.maxTotalUnits;
  protected readonly form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        notBlankValidator,
        Validators.maxLength(CommercialGallery.nameMaxLength),
      ],
    }),
    address: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        notBlankValidator,
        Validators.maxLength(CommercialGallery.addressMaxLength),
      ],
    }),
    totalUnits: new FormControl<number | null>(null, {
      validators: [
        Validators.required,
        Validators.min(1),
        Validators.max(CommercialGallery.maxTotalUnits),
        Validators.pattern(/^\d+$/),
      ],
    }),
  });

  constructor() {
    effect(() => {
      const gallery = this.gallery();
      untracked(() => {
        if (gallery) {
          this.form.reset({
            name: gallery.name,
            address: gallery.address,
            totalUnits: gallery.totalUnits,
          });
        }
      });
    });
  }

  protected discard(): void {
    this.store.clearError();
    const gallery = this.gallery();
    this.form.reset(
      gallery
        ? { name: gallery.name, address: gallery.address, totalUnits: gallery.totalUnits }
        : { name: '', address: '', totalUnits: null },
    );
  }

  protected async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { name, address, totalUnits } = this.form.getRawValue();
    const data = { name, address, totalUnits: Number(totalUnits) };
    const ok = this.gallery()
      ? await this.store.updateGallery(new UpdateCommercialGalleryInfoCommand(data))
      : await this.store.registerGallery(new RegisterCommercialGalleryCommand(data));
    if (ok) {
      this.form.markAsPristine();
      this.saved.emit();
    }
  }
}
