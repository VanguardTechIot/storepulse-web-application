/**
 * Business outcomes that prevent an identity operation from completing.
 * Each value is also used as the i18n key suffix (`iam.errors.<code>`).
 */
export enum IamErrorCode {
  /** The supplied credentials are invalid. */
  InvalidCredentials = 'invalid_credentials',

  /** The account is inactive and cannot be used to sign in. */
  AccountInactive = 'account_inactive',

  /** The account's role is not permitted to perform the operation. */
  RoleNotAllowed = 'role_not_allowed',

  /** The email address is already associated with an account. */
  EmailAlreadyRegistered = 'email_already_registered',

  /** The supplied password does not meet the strength requirements. */
  WeakPassword = 'weak_password',

  /** The password reset code is invalid. */
  InvalidResetCode = 'invalid_reset_code',

  /** The password reset code has expired. */
  ExpiredResetCode = 'expired_reset_code',

  /** An unexpected error occurred during the identity operation. */
  Unexpected = 'unexpected',
}

/**
 * Error representing a business outcome in an identity operation.
 */
export class IamError extends Error {
  /**
   * Creates an identity error with the specified business outcome.
   *
   * @param code - The identity error code.
   */
  constructor(readonly code: IamErrorCode) {
    super(code);
    this.name = 'IamError';
  }
}
