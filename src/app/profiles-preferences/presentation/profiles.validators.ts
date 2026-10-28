import { ValidatorFn } from '@angular/forms';
import { EmailAddress } from '../domain/model/email-address.value-object';
import { PhoneNumber } from '../domain/model/phone-number.value-object';
import { ProfilePhoto } from '../domain/model/profile-photo.value-object';

/** Validates that a non-empty string contains at least one non-whitespace character. */
export const notBlankValidator: ValidatorFn = (control) =>
  typeof control.value === 'string' && control.value.length > 0 && !control.value.trim()
    ? { required: true }
    : null;

/** Validates an email address using the domain email rules. */
export const emailAddressValidator: ValidatorFn = (control) =>
  !control.value || EmailAddress.isValid(control.value) ? null : { email: true };

/** Validates an optional phone number using the domain phone number rules. */
export const phoneNumberValidator: ValidatorFn = (control) =>
  !control.value?.trim() || PhoneNumber.isValid(control.value) ? null : { phoneNumber: true };

/** Validates an optional photo URL using the supported profile photo formats. */
export const profilePhotoValidator: ValidatorFn = (control) =>
  !control.value?.trim() || ProfilePhoto.isValid(control.value) ? null : { photoFormat: true };
