import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { Profile } from '../domain/model/profile.entity';
import { ProfileResource } from './profiles-responses';

/** Converts between profile domain entities and API resources. */
export class ProfileAssembler implements BaseAssembler<Profile, ProfileResource> {
  /**
   * Creates a profile entity from an API resource.
   *
   * @param r - Profile resource returned by the API.
   * @returns The corresponding profile entity.
   */
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

  /**
   * Creates an API resource from a profile entity.
   *
   * @param e - Profile entity to serialize.
   * @returns The corresponding profile resource.
   */
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
