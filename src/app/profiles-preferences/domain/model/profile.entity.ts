import { BaseEntity } from '../../../shared/domain/model/base-entity';
import { EmailAddress } from './email-address.value-object';
import { PhoneNumber } from './phone-number.value-object';
import { ProfilePhoto } from './profile-photo.value-object';
import { ProfilesError, ProfilesErrorCode } from './profiles-error';
import { UpdateProfilePhotoCommand } from './update-profile-photo.command';
import { UpdateProfileCommand } from './update-profile.command';

interface ProfileProps {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  photoUrl: string | null;
}

/**
 * Personal data of a StorePulse user (Aggregate Root): name, contact data and photo (US-06,
 * US-07). The role and the credentials belong to Identity and Access Management.
 *
 * Changes return a new profile, so invalid data never alters the current one (US-07, scenario 2).
 */
export class Profile implements BaseEntity {
  static readonly nameMaxLength = 50;

  private readonly props: ProfileProps;

  constructor(profile: ProfileProps) {
    this.props = { ...profile };
  }

  get id(): string {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get firstName(): string {
    return this.props.firstName;
  }

  get lastName(): string {
    return this.props.lastName;
  }

  get email(): string {
    return this.props.email;
  }

  get phoneNumber(): string | null {
    return this.props.phoneNumber;
  }

  get photoUrl(): string | null {
    return this.props.photoUrl;
  }

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

  hasPhoto(): boolean {
    return this.props.photoUrl !== null;
  }

  static isValidName(name: string): boolean {
    const trimmed = name.trim();
    return trimmed.length > 0 && trimmed.length <= Profile.nameMaxLength;
  }

  /** Applies the edited details (US-07). The phone number is optional. */
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

  /** Replaces the photo, or removes it so the default image is shown (US-06, US-07). */
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
