import { Profile } from '../domain/model/profile.entity';
import { ProfileResource, UpdateProfileResource } from './profiles-responses';

/** Converts between profile domain entities and API resources. */
export class ProfileAssembler {
  toEntityFromResource(r: ProfileResource): Profile {
    return new Profile({
      id: String(r.id),
      userId: String(r.userId),
      firstName: r.firstName,
      lastName: r.lastName,
      email: r.email,
      phoneNumber: r.phoneNumber,
      photoUrl: r.photoUrl,
    });
  }

  toRequestFromEntity(e: Profile): UpdateProfileResource {
    return {
      firstName: e.firstName,
      lastName: e.lastName,
      email: e.email,
      phoneNumber: e.phoneNumber,
      photoUrl: e.photoUrl,
    };
  }
}
