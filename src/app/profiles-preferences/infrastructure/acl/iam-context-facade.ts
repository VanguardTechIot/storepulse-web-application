import { computed, inject, Injectable } from '@angular/core';
import { IamStore } from '../../../identity-access-management/application/iam.store';
import { Role } from '../../../identity-access-management/domain/model/role.enum';
import { iamNav } from '../../../identity-access-management/presentation/iam.nav';
import { AccountRole } from '../../domain/model/account-role.enum';
import { ProfileOwner } from '../../domain/model/profile-owner';

const roles: Record<Role, AccountRole> = {
  [Role.GalleryAdministrator]: AccountRole.GalleryAdministrator,
  [Role.Tenant]: AccountRole.Tenant,
};

/**
 * Anti-corruption layer towards Identity and Access Management: the signed-in account seen as the
 * owner of a profile, and the session actions the profile page offers.
 */
@Injectable({ providedIn: 'root' })
export class IamContextFacade {
  private readonly iamStore = inject(IamStore);

  /** Where the profile page goes after Log Out (US-04). */
  readonly signInRoute = iamNav.signIn();

  readonly currentOwner = computed<ProfileOwner | null>(() => {
    const user = this.iamStore.currentUser();
    return user ? { userId: user.id, role: roles[user.role] } : null;
  });

  signOut(): void {
    this.iamStore.signOut();
  }

  /** The profile email is also the sign-in email, so the session must show the new one. */
  syncAccountEmail(email: string): void {
    this.iamStore.syncAccountEmail(email);
  }
}
