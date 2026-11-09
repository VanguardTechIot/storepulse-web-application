import { inject, Injectable } from '@angular/core';
import { InvitationStatus } from '../../../property-management/domain/model/invitation-status.enum';
import { PROPERTY_MANAGEMENT_REPOSITORY } from '../../../property-management/infrastructure/property-management.token';
import { Tenant } from '../../domain/model/tenant';
import { TenantAssignment } from '../../domain/model/tenant-assignment.entity';

/**
 * Anti-corruption layer towards Property Management: the tenants of the gallery, known by the
 * invitation they accepted.
 *
 * Accepting an invitation assigns the tenant to its store, so each assignment is matched with the
 * accepted invitation of the same store sent before it, which gives the tenant's email. The REST
 * API does not let an administrator read the profile of a tenant, so the email is also the name
 * shown.
 */
@Injectable({ providedIn: 'root' })
export class TenantDirectoryFacade {
  private readonly propertyRepository = inject(PROPERTY_MANAGEMENT_REPOSITORY);

  async listTenants(assignments: readonly TenantAssignment[]): Promise<Tenant[]> {
    const accepted = (await this.propertyRepository.listInvitations())
      .filter((invitation) => invitation.storedStatus === InvitationStatus.Accepted)
      .sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime());
    const tenants = new Map<string, Tenant>();
    for (const assignment of [...assignments].sort(
      (a, b) => b.assignedAt.getTime() - a.assignedAt.getTime(),
    )) {
      if (tenants.has(assignment.tenantId)) continue;
      const invitation = accepted.find(
        (candidate) =>
          candidate.unitId === assignment.commercialUnitId &&
          candidate.sentAt <= assignment.assignedAt,
      );
      const email = invitation?.email ?? '';
      tenants.set(assignment.tenantId, {
        id: assignment.tenantId,
        fullName: email || assignment.tenantId,
        email,
      });
    }
    return [...tenants.values()].sort((a, b) => a.fullName.localeCompare(b.fullName));
  }
}
