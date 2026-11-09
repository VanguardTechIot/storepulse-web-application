import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { ApiError } from '../../../shared/domain/model/api-error';
import { sendRequest } from '../../../shared/infrastructure/send-request';
import { Profile } from '../../domain/model/profile.entity';
import { ProfilesError, ProfilesErrorCode } from '../../domain/model/profiles-error';
import { ProfilesRepository } from '../../domain/repository/profiles.repository';
import { ProfileAssembler } from '../profiles-assemblers';
import { ProfileResource } from '../profiles-responses';

const apiUrl = environment.platformProviderApiBaseUrl;

const codes = new Set<string>(Object.values(ProfilesErrorCode));

/** The REST API answers the business code in `message`; a bare 404 means there is no profile. */
const failed = (error: ApiError) => {
  if (codes.has(error.message)) return new ProfilesError(error.message as ProfilesErrorCode);
  return new ProfilesError(
    error.status === 404 ? ProfilesErrorCode.ProfileNotFound : ProfilesErrorCode.Unexpected,
  );
};

/**
 * Builds the API URL for a user's profile.
 *
 * @param userId - Identifier of the profile owner.
 * @returns The encoded profile endpoint URL.
 */
function profileUrl(userId: string): string {
  const path = environment.platformProviderUserProfileEndpointPath;
  return `${apiUrl}${path.replace('{userId}', encodeURIComponent(userId))}`;
}

/**
 * HTTP implementation of the repository over the StorePulse REST API. The profile email is also
 * the sign-in email: `PUT /users/{userId}/profile` checks that it is free and moves the account.
 */
export class HttpProfilesRepository implements ProfilesRepository {
  private readonly http = inject(HttpClient);
  private readonly profileAssembler = new ProfileAssembler();

  async getProfile(userId: string): Promise<Profile> {
    const resource = await sendRequest(this.http.get<ProfileResource>(profileUrl(userId)), failed);
    return this.profileAssembler.toEntityFromResource(resource);
  }

  async updateProfile(profile: Profile): Promise<Profile> {
    const resource = await sendRequest(
      this.http.put<ProfileResource>(
        profileUrl(profile.userId),
        this.profileAssembler.toRequestFromEntity(profile),
      ),
      failed,
    );
    return this.profileAssembler.toEntityFromResource(resource);
  }
}
