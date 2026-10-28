/**
 * Business outcomes that prevent an identity operation from completing.
 * The value doubles as the i18n key suffix (`iam.errors.<code>`).
 */
export enum IamErrorCode {
  InvalidCredentials = 'invalid_credentials',
  AccountInactive = 'account_inactive',
  RoleNotAllowed = 'role_not_allowed',
  EmailAlreadyRegistered = 'email_already_registered',
  WeakPassword = 'weak_password',
  InvalidResetCode = 'invalid_reset_code',
  ExpiredResetCode = 'expired_reset_code',
  Unexpected = 'unexpected',
}

export class IamError extends Error {
  constructor(readonly code: IamErrorCode) {
    super(code);
    this.name = 'IamError';
  }
}
