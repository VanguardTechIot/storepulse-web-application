import { InjectionToken } from '@angular/core';
import { ProfilesRepository } from '../domain/repository/profiles.repository';
import { HttpProfilesRepository } from './http/http-profiles.repository';

/**
 * Injection token for the Profiles and Preferences repository, implemented over the StorePulse
 * REST API.
 */
export const PROFILES_REPOSITORY = new InjectionToken<ProfilesRepository>('PROFILES_REPOSITORY', {
  providedIn: 'root',
  factory: () => new HttpProfilesRepository(),
});
