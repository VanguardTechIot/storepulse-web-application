import { ValidatorFn } from '@angular/forms';
import { TenantInvitation } from '../domain/model/tenant-invitation.entity';
import { UnitDimensions } from '../domain/model/unit-dimensions.value-object';

/** Form validators backed by the domain rules, so the UI and the model never disagree. */
export const notBlankValidator: ValidatorFn = (control) =>
  typeof control.value === 'string' && control.value.length > 0 && !control.value.trim()
    ? { required: true }
    : null;

export const areaValidator: ValidatorFn = (control) =>
  control.value === null || control.value === '' || UnitDimensions.isValid(Number(control.value))
    ? null
    : { area: true };

export const invitationEmailValidator: ValidatorFn = (control) =>
  !control.value || TenantInvitation.isValidEmail(control.value) ? null : { email: true };
