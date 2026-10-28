import { BaseEntity } from '../../../shared/domain/model/base-entity';
import { EmailAddress } from './email-address.value-object';
import { PhoneNumber } from './phone-number.value-object';
import { ProfilePhoto } from './profile-photo.value-object';
import { ProfilesError, ProfilesErrorCode } from './profiles-error';
import { UpdateProfilePhotoCommand } from './update-profile-photo.command';
import { UpdateProfileCommand } from './update-profile.command';

interface ProfileProps {
  /** Profile identifier. */
  id: string;
  /** Identifier of the account that owns the profile. */
  userId: string;
  /** Profile owner's first name. */
  firstName: string;
  /** Profile owner's last name. */
  lastName: string;
  /** Profile owner's sign-in email address. */
  email: string;
  /** Optional contact phone number. */
  phoneNumber: string | null;
  /** Optional profile photo URL. */
  photoUrl: string | null;
}

/**
 * Personal data of a StorePulse user (Aggregate Root): name, contact data and photo (US-06,
 * US-07). The role and the credentials belong to Identity and Access Management.
 *
 * Changes return a new profile, so invalid data never alters the current one (US-07, scenario 2).
 */
export class Profile implements BaseEntity {
  /** Maximum allowed length for each name field. */
  static readonly nameMaxLength = 50;

  private readonly props: ProfileProps;

  /**
   * Creates a profile entity.
   *
   * @param profile - Profile identifier, owner, personal details, and contact information.
   */
  constructor(profile: ProfileProps) {
    this.props = { ...profile };
  }

  /** Gets the profile identifier. */
  get id(): string {
    return this.props.id;
  }

  /** Gets the identifier of the account that owns the profile. */
  get userId(): string {
    return this.props.userId;
  }

  /** Gets the owner's first name. */
  get firstName(): string {
    return this.props.firstName;
  }

  /** Gets the owner's last name. */
  get lastName(): string {
    return this.props.lastName;
  }

  /** Gets the owner's sign-in email address. */
  get email(): string {
    return this.props.email;
  }

  /** Gets the optional contact phone number. */
  get phoneNumber(): string | null {
    return this.props.phoneNumber;
  }

  /** Gets the optional profile photo URL. */
  get photoUrl(): string | null {
    return this.props.photoUrl;
  }

  /** Gets the owner's full name with surrounding whitespace removed. */
  get fullName(): string {
    return `${this.props.firstName} ${this.props.lastName}`.trim();
  }

  /** Shown in the avatar when the photo is missing or cannot be loaded. */
  get initials(): string {
    return [this.props.firstName, this.props.lastName]
      .map((name) => name.trim().charAt(0))
      .join('')
      .toUpperCase();
  }

  /**
   * Determines whether the profile has a photo URL.
   *
   * @returns `true` if a photo URL is set; otherwise, `false`.
   */
  hasPhoto(): boolean {
    return this.props.photoUrl !== null;
  }

  /**
   * Checks whether a name is non-empty and within the maximum length.
   *
   * @param name - Name to validate.
   * @returns `true` if the trimmed name is valid; otherwise, `false`.
   */
  static isValidName(name: string): boolean {
    const trimmed = name.trim();
    return trimmed.length > 0 && trimmed.length <= Profile.nameMaxLength;
  }

  /**
   * Applies edited profile details, returning a new profile if validation succeeds.
   *
   * @param command - Updated name and contact details.
   * @returns A new profile containing the validated and normalized details.
   * @throws {ProfilesError} If a name, email address, or phone number is invalid.
   */
  update(command: UpdateProfileCommand): Profile {
    if (!Profile.isValidName(command.firstName) || !Profile.isValidName(command.lastName)) {
      throw new ProfilesError(ProfilesErrorCode.InvalidName);
    }
    if (!EmailAddress.isValid(command.email)) {
      throw new ProfilesError(ProfilesErrorCode.InvalidEmail);
    }
    const phoneNumber = command.phoneNumber?.trim() || null;
    if (phoneNumber && !PhoneNumber.isValid(phoneNumber)) {
      throw new ProfilesError(ProfilesErrorCode.InvalidPhoneNumber);
    }
    return new Profile({
      ...this.props,
      firstName: command.firstName.trim(),
      lastName: command.lastName.trim(),
      email: new EmailAddress(command.email).value,
      phoneNumber: phoneNumber ? new PhoneNumber(phoneNumber).value : null,
    });
  }

  /**
   * Replaces the profile photo or removes it to use the default image.
   *
   * @param command - New photo URL, or `null` to remove the photo.
   * @returns A new profile with the updated photo.
   * @throws {ProfilesError} If the photo URL uses an unsupported format.
   */
  changePhoto(command: UpdateProfilePhotoCommand): Profile {
    const photoUrl = command.photoUrl?.trim() || null;
    if (photoUrl && !ProfilePhoto.isValid(photoUrl)) {
      throw new ProfilesError(ProfilesErrorCode.UnsupportedPhotoFormat);
    }
    return new Profile({
      ...this.props,
      photoUrl: photoUrl ? new ProfilePhoto(photoUrl).url : null,
    });
  }
}
