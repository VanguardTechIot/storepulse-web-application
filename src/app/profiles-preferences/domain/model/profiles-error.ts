/**
 * Business outcomes that prevent a profile operation from completing.
 * The value doubles as the i18n key suffix (`profiles.errors.<code>`).
 */
export enum ProfilesErrorCode {
  InvalidName = 'invalid_name',
  InvalidEmail = 'invalid_email',
  InvalidPhoneNumber = 'invalid_phone_number',
  UnsupportedPhotoFormat = 'unsupported_photo_format',
  EmailAlreadyRegistered = 'email_already_registered',
  ProfileNotFound = 'profile_not_found',
  Unexpected = 'unexpected',
}

export class ProfilesError extends Error {
  constructor(readonly code: ProfilesErrorCode) {
    super(code);
    this.name = 'ProfilesError';
  }
}
