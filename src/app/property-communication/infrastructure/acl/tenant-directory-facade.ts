import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Tenant } from '../../domain/model/tenant';

interface TenantAccountResource {
  id: string;
  email: string;
  role: string;
  status: string;
}

interface TenantProfileResource {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
}

const apiUrl = environment.platformProviderApiBaseUrl;
const usersUrl = `${apiUrl}${environment.platformProviderUsersEndpointPath}`;
const profilesUrl = `${apiUrl}${environment.platformProviderProfilesEndpointPath}`;

/**
 * Anti-corruption layer towards Identity and Access Management and Profiles and Preferences: the
 * registered tenants (accounts with the TENANT role) with the name of their profile.
 *
 * The local JSON API has no tenants endpoint, so they are read from the users and profiles
 * collections. When the REST API exposes them, only this class changes.
 */
@Injectable({ providedIn: 'root' })
export class TenantDirectoryFacade {
  private readonly http = inject(HttpClient);

  async listTenants(): Promise<Tenant[]> {
    const [accounts, profiles] = await Promise.all([
      firstValueFrom(
        this.http.get<TenantAccountResource[]>(usersUrl, { params: { role: 'TENANT' } }),
      ),
      firstValueFrom(this.http.get<TenantProfileResource[]>(profilesUrl)),
    ]);
    const profileByUser = new Map(profiles.map((profile) => [profile.userId, profile]));
    return accounts
      .filter((account) => account.status === 'ACTIVE')
      .map((account) => {
        const profile = profileByUser.get(account.id);
        const fullName = profile ? `${profile.firstName} ${profile.lastName}`.trim() : '';
        return { id: account.id, fullName: fullName || account.email, email: account.email };
      })
      .sort((a, b) => a.fullName.localeCompare(b.fullName));
  }
}
