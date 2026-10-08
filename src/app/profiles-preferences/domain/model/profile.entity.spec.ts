import { Profile } from './profile.entity';
import { ProfilesError, ProfilesErrorCode } from './profiles-error';
import { UpdateProfilePhotoCommand } from './update-profile-photo.command';
import { UpdateProfileCommand } from './update-profile.command';

describe('Profile', () => {
  const profile = new Profile({
    id: 'usr-001',
    userId: 'usr-001',
    firstName: 'Carmen',
    lastName: 'Mendoza Ríos',
    email: 'carmen.mendoza@galeriacentral.pe',
    phoneNumber: '+51 987 654 321',
    photoUrl: null,
  });

  function details(changes: Partial<UpdateProfileCommand> = {}): UpdateProfileCommand {
    return new UpdateProfileCommand({
      firstName: 'Carmen',
      lastName: 'Mendoza Ríos',
      email: 'carmen.mendoza@galeriacentral.pe',
      phoneNumber: '+51 987 654 321',
      ...changes,
    });
  }

  function errorOf(change: () => unknown): ProfilesErrorCode | null {
    try {
      change();
      return null;
    } catch (error) {
      return error instanceof ProfilesError ? error.code : null;
    }
  }

  it('shows the full name and the initials', () => {
    expect(profile.fullName).toBe('Carmen Mendoza Ríos');
    expect(profile.initials).toBe('CM');
  });

  it('saves valid details, normalizing the email and the phone number', () => {
    const updated = profile.update(
      details({ firstName: ' Carmen Rosa ', email: ' Carmen.Rosa@GaleriaCentral.pe ', phoneNumber: '+51  999 111 222' }),
    );

    expect(updated.firstName).toBe('Carmen Rosa');
    expect(updated.email).toBe('carmen.rosa@galeriacentral.pe');
    expect(updated.phoneNumber).toBe('+51 999 111 222');
  });

  it('treats the phone number as optional', () => {
    expect(profile.update(details({ phoneNumber: '  ' })).phoneNumber).toBeNull();
  });

  it('rejects invalid data without changing the profile (US-07, scenario 2)', () => {
    expect(errorOf(() => profile.update(details({ email: 'carmen.mendoza@galeriacentral' })))).toBe(
      ProfilesErrorCode.InvalidEmail,
    );
    expect(errorOf(() => profile.update(details({ firstName: ' ' })))).toBe(ProfilesErrorCode.InvalidName);
    expect(errorOf(() => profile.update(details({ lastName: 'x'.repeat(51) })))).toBe(
      ProfilesErrorCode.InvalidName,
    );
    expect(errorOf(() => profile.update(details({ phoneNumber: '98-76' })))).toBe(
      ProfilesErrorCode.InvalidPhoneNumber,
    );
    expect(profile.email).toBe('carmen.mendoza@galeriacentral.pe');
  });

  it('accepts JPG and PNG photo links (US-07, scenario 3)', () => {
    const photo = (photoUrl: string) => profile.changePhoto(new UpdateProfilePhotoCommand({ photoUrl }));

    expect(photo('https://cdn.storepulse.pe/users/carmen.JPG').photoUrl).toBe(
      'https://cdn.storepulse.pe/users/carmen.JPG',
    );
    expect(photo('https://cdn.storepulse.pe/users/carmen.png?v=2').hasPhoto()).toBe(true);
  });

  it('rejects other image formats and links that are not web addresses', () => {
    const photoError = (photoUrl: string) =>
      errorOf(() => profile.changePhoto(new UpdateProfilePhotoCommand({ photoUrl })));

    expect(photoError('https://cdn.storepulse.pe/users/carmen.gif')).toBe(
      ProfilesErrorCode.UnsupportedPhotoFormat,
    );
    expect(photoError('ftp://cdn.storepulse.pe/users/carmen.png')).toBe(
      ProfilesErrorCode.UnsupportedPhotoFormat,
    );
    expect(photoError('carmen.png')).toBe(ProfilesErrorCode.UnsupportedPhotoFormat);
  });

  it('goes back to the default image when the photo is removed (US-06, scenario 2)', () => {
    const withPhoto = profile.changePhoto(
      new UpdateProfilePhotoCommand({ photoUrl: 'https://cdn.storepulse.pe/users/carmen.png' }),
    );

    expect(withPhoto.changePhoto(new UpdateProfilePhotoCommand({ photoUrl: null })).hasPhoto()).toBe(
      false,
    );
  });
});
