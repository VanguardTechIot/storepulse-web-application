import { Profile } from '../model/profile.entity';

/**
 * Access abstraction of the Profiles and Preferences context.
 * Mirrors TS-04: `GET` and `PUT /users/{userId}/profile`. Business errors are thrown as
 * `ProfilesError`.
 */
export interface ProfilesRepository {
  getProfile(userId: string): Promise<Profile>;
  /** Saves the whole profile and returns it as stored. */
  updateProfile(profile: Profile): Promise<Profile>;
}
