import { Component, computed, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
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
import { AccountRole } from '../../../domain/model/account-role.enum';
import { Profile } from '../../../domain/model/profile.entity';
import { ProfilePhoto } from '../../../domain/model/profile-photo.value-object';
import { UpdateProfilePhotoCommand } from '../../../domain/model/update-profile-photo.command';
import { profilePhotoValidator } from '../../profiles.validators';
import { ProfileAvatar } from '../profile-avatar/profile-avatar';

/**
 * Who the user is (US-06): photo or default image, name, email and role. Photos are stored as
 * links, so changing it means entering the link of a JPG or PNG image (US-07, scenario 3).
 */
@Component({
  selector: 'app-profile-photo-card',
  imports: [
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    ProfileAvatar,
    ReactiveFormsModule,
    TranslatePipe,
  ],
  templateUrl: './profile-photo-card.html',
  styleUrl: './profile-photo-card.css',
})
export class ProfilePhotoCard {
  protected readonly store = inject(ProfilesStore);
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(TranslationService);

  /** Profile whose photo and account details are displayed or edited. */
  readonly profile = input.required<Profile>();
  /** Role of the profile owner, if available. */
  readonly role = input<AccountRole | null>(null);

  /** Whether the profile photo editor is open. */
  protected readonly editing = signal(false);
  /** Form containing the photo URL being edited. */
  protected readonly form = new FormGroup({
    photoUrl: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, profilePhotoValidator],
    }),
  });
  /** Current photo URL value, used to calculate the preview. */
  private readonly typedUrl = toSignal(this.form.controls.photoUrl.valueChanges, {
    initialValue: '',
  });
  /** The typed link is previewed as soon as it has a supported format. */
  protected readonly previewUrl = computed(() => {
    const url = this.typedUrl().trim();
    return ProfilePhoto.isValid(url) ? url : null;
  });

  /** Opens the photo editor and initializes it with the current photo URL. */
  protected startEditing(): void {
    this.store.clearError();
    this.form.reset({ photoUrl: this.profile().photoUrl ?? '' });
    this.editing.set(true);
  }

  /** Closes the photo editor without saving changes. */
  protected cancel(): void {
    this.editing.set(false);
  }

  /** Marks the photo URL invalid when its preview cannot be loaded and prevents it from being saved. */
  protected onPreviewFailed(): void {
    if (!this.editing()) return;
    const control = this.form.controls.photoUrl;
    control.setErrors({ ...control.errors, photoNotLoaded: true });
    control.markAsTouched();
  }

  /**
   * Validates and saves the new profile photo URL.
   */
  protected async save(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const command = new UpdateProfilePhotoCommand({ photoUrl: this.form.controls.photoUrl.value });
    if (await this.store.updatePhoto(command)) {
      this.editing.set(false);
      this.toast.show('success', this.i18n.t('profiles.photo.saved'));
    }
  }

  /** Removes the current profile photo and displays the default image. */
  protected async remove(): Promise<void> {
    this.store.clearError();
    if (await this.store.updatePhoto(new UpdateProfilePhotoCommand({ photoUrl: null }))) {
      this.toast.show('success', this.i18n.t('profiles.photo.removed'));
    }
  }
}
