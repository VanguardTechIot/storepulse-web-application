import { ValidatorFn } from '@angular/forms';
import { Email } from '../domain/model/email.value-object';
import { PasswordPolicy } from '../domain/model/password-policy';
import { PasswordResetCode } from '../domain/model/password-reset-code.value-object';

/** Validates an email address, allowing an empty value for required-validator handling. */
export const emailValidator: ValidatorFn = (control) =>
  !control.value || Email.isValid(control.value) ? null : { email: true };

/** Validates a password against the domain password policy. */
export const passwordPolicyValidator: ValidatorFn = (control) =>
  !control.value || PasswordPolicy.isSatisfiedBy(control.value) ? null : { passwordPolicy: true };

/** Validates that a password reset code contains the required format. */
export const resetCodeValidator: ValidatorFn = (control) =>
  !control.value || PasswordResetCode.isValid(control.value) ? null : { resetCode: true };
