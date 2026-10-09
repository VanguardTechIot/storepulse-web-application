import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { Profile } from '../domain/model/profile.entity';
import { ProfileResource } from './profiles-responses';

export class ProfileAssembler implements BaseAssembler<Profile, ProfileResource> {
  toEntityFromResource(r: ProfileResource): Profile {
    return new Profile({
      id: r.id,
      userId: r.userId,
      firstName: r.firstName,
      lastName: r.lastName,
      email: r.email,
      phoneNumber: r.phoneNumber,
      photoUrl: r.photoUrl,
    });
  }

  toResourceFromEntity(e: Profile): ProfileResource {
    return {
      id: e.id,
      userId: e.userId,
      firstName: e.firstName,
      lastName: e.lastName,
      email: e.email,
      phoneNumber: e.phoneNumber,
      photoUrl: e.photoUrl,
    };
  }
}
