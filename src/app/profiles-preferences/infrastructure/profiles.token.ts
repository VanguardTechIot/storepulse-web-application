import { InjectionToken } from '@angular/core';
import { ProfilesRepository } from '../domain/repository/profiles.repository';
import { HttpProfilesRepository } from './http/http-profiles.repository';

/**
 * Single injection point of the repository.
 * It points to the local data server today; with the real REST API, swap the implementation here.
 */
export const PROFILES_REPOSITORY = new InjectionToken<ProfilesRepository>('PROFILES_REPOSITORY', {
  providedIn: 'root',
  factory: () => new HttpProfilesRepository(),
});
