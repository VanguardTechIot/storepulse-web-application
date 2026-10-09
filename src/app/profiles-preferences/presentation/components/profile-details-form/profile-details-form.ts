import { Component, effect, inject, input, untracked } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { TranslationService } from '../../../../shared/infrastructure/i18n/translation.service';
import { ToastService } from '../../../../shared/presentation/components/toast-host/toast.service';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { ProfilesStore } from '../../../application/profiles.store';
import { Profile } from '../../../domain/model/profile.entity';
import { UpdateProfileCommand } from '../../../domain/model/update-profile.command';
import {
  emailAddressValidator,
  notBlankValidator,
  phoneNumberValidator,
} from '../../profiles.validators';

/**
 * Edit details card of My profile (US-07). Invalid data shows its error and is not saved.
 */
@Component({
  selector: 'app-profile-details-form',
  imports: [
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    ReactiveFormsModule,
    TranslatePipe,
  ],
  templateUrl: './profile-details-form.html',
  styleUrl: './profile-details-form.css',
})
export class ProfileDetailsForm {
  protected readonly store = inject(ProfilesStore);
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(TranslationService);

  readonly profile = input.required<Profile>();

  protected readonly nameMaxLength = Profile.nameMaxLength;
  protected readonly form = new FormGroup({
    firstName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, notBlankValidator, Validators.maxLength(Profile.nameMaxLength)],
    }),
    lastName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, notBlankValidator, Validators.maxLength(Profile.nameMaxLength)],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, emailAddressValidator],
    }),
    phoneNumber: new FormControl('', { nonNullable: true, validators: [phoneNumberValidator] }),
  });

  constructor() {
    // Follows the saved profile (first load, new photo) unless the user is editing the details.
    effect(() => {
      const profile = this.profile();
      untracked(() => {
        if (this.form.pristine) this.fill(profile);
      });
    });
  }

  protected discard(): void {
    this.store.clearError();
    this.fill(this.profile());
  }

  protected async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { firstName, lastName, email, phoneNumber } = this.form.getRawValue();
    const command = new UpdateProfileCommand({ firstName, lastName, email, phoneNumber });
    if (await this.store.updateProfile(command)) {
      const saved = this.store.profile();
      if (saved) this.fill(saved);
      this.toast.show('success', this.i18n.t('profiles.form.saved'));
    }
  }

  private fill(profile: Profile): void {
    this.form.reset({
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      phoneNumber: profile.phoneNumber ?? '',
    });
  }
}
