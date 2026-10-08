/**
 * Business outcomes that prevent an identity operation from completing.
 * The value doubles as the i18n key suffix (`iam.errors.<code>`).
 */
export enum IamErrorCode {
  InvalidCredentials = 'invalid-credentials',
  AccountInactive = 'account-inactive',
  RoleNotAllowed = 'role-not-allowed',
  EmailAlreadyRegistered = 'email-already-registered',
  WeakPassword = 'weak-password',
  InvalidResetCode = 'invalid-reset-code',
  ExpiredResetCode = 'expired-reset-code',
  Unexpected = 'unexpected',
}

export class IamError extends Error {
  constructor(readonly code: IamErrorCode) {
    super(code);
    this.name = 'IamError';
  }
}
