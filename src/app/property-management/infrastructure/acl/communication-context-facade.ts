import { inject, Injectable } from '@angular/core';
import { ManagementTenantCommunicationFacade } from '../../../property-communication/application/management-tenant-communication.facade';
import { UnitTenant } from '../../domain/model/unit-tenant';

/**
 * Anti-corruption layer towards Property Communication, which owns the tenant assignments: who
 * occupies each store and where to manage it.
 */
@Injectable({ providedIn: 'root' })
export class CommunicationContextFacade {
  private readonly communication = inject(ManagementTenantCommunicationFacade);

  /** Screen where the administrator assigns registered tenants to stores. */
  readonly assignmentsRoute = ['/communication', 'assignments'];

  /** Active tenant of each unit of the administrator, by unit id. */
  async tenantsByUnit(administratorId: string): Promise<Map<string, UnitTenant>> {
    const assignments = await this.communication.activeAssignments(administratorId);
    return new Map(
      assignments.map((assignment) => [
        assignment.commercialUnitId,
        {
          tenantId: assignment.tenantId,
          fullName: assignment.tenantName,
          email: assignment.tenantEmail,
          assignedAt: assignment.assignedAt,
        },
      ]),
    );
  }
}
