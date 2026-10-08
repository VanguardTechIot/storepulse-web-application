import { ValidatorFn } from '@angular/forms';
import { EmailAddress } from '../domain/model/email-address.value-object';
import { PhoneNumber } from '../domain/model/phone-number.value-object';
import { ProfilePhoto } from '../domain/model/profile-photo.value-object';

/** Form validators backed by the domain rules, so the UI and the model never disagree. */
export const notBlankValidator: ValidatorFn = (control) =>
  typeof control.value === 'string' && control.value.length > 0 && !control.value.trim()
    ? { required: true }
    : null;

export const emailAddressValidator: ValidatorFn = (control) =>
  !control.value || EmailAddress.isValid(control.value) ? null : { email: true };

export const phoneNumberValidator: ValidatorFn = (control) =>
  !control.value?.trim() || PhoneNumber.isValid(control.value) ? null : { phoneNumber: true };

export const profilePhotoValidator: ValidatorFn = (control) =>
  !control.value?.trim() || ProfilePhoto.isValid(control.value) ? null : { photoFormat: true };
