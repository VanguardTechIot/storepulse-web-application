/**
 * Business outcomes that prevent a profile operation from completing.
 * The value doubles as the i18n key suffix (`profiles.errors.<code>`).
 */
export enum ProfilesErrorCode {
  /** A profile name is empty or exceeds its maximum length. */
  InvalidName = 'invalid_name',
  /** A profile email address is invalid. */
  InvalidEmail = 'invalid_email',
  /** A profile phone number is invalid. */
  InvalidPhoneNumber = 'invalid_phone_number',
  /** A profile photo URL uses an unsupported format. */
  UnsupportedPhotoFormat = 'unsupported_photo_format',
  /** The email address is already associated with another account. */
  EmailAlreadyRegistered = 'email_already_registered',
  /** The requested profile could not be found. */
  ProfileNotFound = 'profile_not_found',
  /** An unexpected error occurred during the profile operation. */
  Unexpected = 'unexpected',
}

/** Error representing a business outcome in a profile operation. */
export class ProfilesError extends Error {
  /**
   * Creates a profile error with the specified business outcome.
   *
   * @param code - The profile error code.
   */
  constructor(readonly code: ProfilesErrorCode) {
    super(code);
    this.name = 'ProfilesError';
  }
}
