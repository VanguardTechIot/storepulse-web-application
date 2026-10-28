import { Profile } from '../model/profile.entity';

/**
 * Access abstraction of the Profiles and Preferences context.
 * Mirrors TS-04: `GET` and `PUT /users/{userId}/profile`. Business errors are thrown as
 * `ProfilesError`.
 */
export interface ProfilesRepository {
  /**
   * Retrieves a profile by its owner's account identifier.
   *
   * @param userId - Identifier of the profile owner.
   * @returns A promise that resolves to the profile.
   * @throws {ProfilesError} If the profile cannot be found or another business error occurs.
   */
  getProfile(userId: string): Promise<Profile>;

  /**
   * Saves the complete profile and returns its persisted representation.
   *
   * @param profile - Profile to save.
   * @returns A promise that resolves to the saved profile.
   * @throws {ProfilesError} If the profile cannot be saved due to a business error.
   */
  updateProfile(profile: Profile): Promise<Profile>;
}
