import { InjectionToken } from '@angular/core';
import { ProfilesRepository } from '../domain/repository/profiles.repository';
import { HttpProfilesRepository } from './http/http-profiles.repository';

/**
 * Injection token for the Profiles and Preferences repository.
 *
 * Currently uses the local data server implementation. Replace the provider here to use the
 * production REST API implementation.
 */
export const PROFILES_REPOSITORY = new InjectionToken<ProfilesRepository>('PROFILES_REPOSITORY', {
  providedIn: 'root',
  factory: () => new HttpProfilesRepository(),
});
