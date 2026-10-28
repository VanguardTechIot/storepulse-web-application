import { computed, inject, Injectable } from '@angular/core';
import { IamStore } from '../../../iam/application/iam.store';
import { Role } from '../../../iam/domain/model/role.enum';
import { iamNav } from '../../../iam/presentation/iam.nav';
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

  /** Router commands for the sign-in page shown after sign-out. */
  readonly signInRoute = iamNav.signIn();

  /** Current signed-in account represented as a profile owner, or `null` if signed out. */
  readonly currentOwner = computed<ProfileOwner | null>(() => {
    const user = this.iamStore.currentUser();
    return user ? { userId: user.id, role: roles[user.role] } : null;
  });

  /** Signs out the current user through the IAM context. */
  signOut(): void {
    this.iamStore.signOut();
  }

  /**
   * Synchronizes a changed profile email with the signed-in account.
   *
   * @param email - Updated email address.
   */
  syncAccountEmail(email: string): void {
    this.iamStore.syncAccountEmail(email);
  }
}
