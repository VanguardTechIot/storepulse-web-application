import { computed, inject, Injectable } from '@angular/core';
import { IamStore } from '../../../identity-access-management/application/iam.store';

/**
 * Anti-corruption layer towards Identity and Access Management: the signed-in gallery
 * administrator, who owns the gallery (`administratorId`).
 */
@Injectable({ providedIn: 'root' })
export class IamContextFacade {
  private readonly iamStore = inject(IamStore);

  readonly currentAdministratorId = computed<string | null>(() => {
    const user = this.iamStore.currentUser();
    return user?.isGalleryAdministrator() ? user.id : null;
  });
}
