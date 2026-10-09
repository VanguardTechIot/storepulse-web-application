import { ValidatorFn } from '@angular/forms';
import { Email } from '../domain/model/email.value-object';
import { PasswordPolicy } from '../domain/model/password-policy';
import { PasswordResetCode } from '../domain/model/password-reset-code.value-object';

/** Form validators backed by the domain rules, so the UI and the model never disagree. */
export const emailValidator: ValidatorFn = (control) =>
  !control.value || Email.isValid(control.value) ? null : { email: true };

export const passwordPolicyValidator: ValidatorFn = (control) =>
  !control.value || PasswordPolicy.isSatisfiedBy(control.value) ? null : { passwordPolicy: true };

export const resetCodeValidator: ValidatorFn = (control) =>
  !control.value || PasswordResetCode.isValid(control.value) ? null : { resetCode: true };
