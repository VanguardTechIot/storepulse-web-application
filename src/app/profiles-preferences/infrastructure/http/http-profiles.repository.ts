import { HttpClient, HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Profile } from '../../domain/model/profile.entity';
import { ProfilesError, ProfilesErrorCode } from '../../domain/model/profiles-error';
import { ProfilesRepository } from '../../domain/repository/profiles.repository';
import { ProfileAssembler } from '../profiles-assemblers';
import { AccountEmailResource, ProfileResource } from '../profiles-responses';

const apiUrl = environment.platformProviderApiBaseUrl;
const usersUrl = `${apiUrl}${environment.platformProviderUsersEndpointPath}`;

function profileUrl(userId: string): string {
  const path = environment.platformProviderUserProfileEndpointPath;
  return `${apiUrl}${path.replace('{userId}', encodeURIComponent(userId))}`;
}

/**
 * HTTP implementation of the repository over the local data server (json-server).
 *
 * json-server only stores data, so this class reproduces what the REST API will do on
 * `PUT /users/{userId}/profile`: the profile email is also the sign-in email, so it must be free
 * and the account must follow it. When the backend exists, only this class changes.
 */
export class HttpProfilesRepository implements ProfilesRepository {
  private readonly http = inject(HttpClient);
  private readonly profileAssembler = new ProfileAssembler();

  async getProfile(userId: string): Promise<Profile> {
    try {
      const profile = await firstValueFrom(this.http.get<ProfileResource>(profileUrl(userId)));
      return this.profileAssembler.toEntityFromResource(profile);
    } catch (error) {
      throw this.translate(error);
    }
  }

  async updateProfile(profile: Profile): Promise<Profile> {
    try {
      await this.syncAccountEmail(profile);
      const saved = await firstValueFrom(
        this.http.put<ProfileResource>(
          profileUrl(profile.userId),
          this.profileAssembler.toResourceFromEntity(profile),
        ),
      );
      return this.profileAssembler.toEntityFromResource(saved);
    } catch (error) {
      throw this.translate(error);
    }
  }

  private async syncAccountEmail(profile: Profile): Promise<void> {
    const params = { email: profile.email };
    const accounts = await firstValueFrom(
      this.http.get<AccountEmailResource[]>(usersUrl, { params }),
    );
    if (accounts.some((account) => account.id !== profile.userId)) {
      throw new ProfilesError(ProfilesErrorCode.EmailAlreadyRegistered);
    }
    if (accounts.length === 0) {
      await firstValueFrom(
        this.http.patch(`${usersUrl}/${encodeURIComponent(profile.userId)}`, {
          email: profile.email,
        }),
      );
    }
  }

  /** Maps the TS-04 status codes to business errors; anything else stays unexpected. */
  private translate(error: unknown): unknown {
    if (!(error instanceof HttpErrorResponse)) return error;
    switch (error.status) {
      case HttpStatusCode.NotFound:
        return new ProfilesError(ProfilesErrorCode.ProfileNotFound);
      case HttpStatusCode.UnsupportedMediaType:
        return new ProfilesError(ProfilesErrorCode.UnsupportedPhotoFormat);
      default:
        return error;
    }
  }
}
