import { inject, Injectable } from '@angular/core';
import { NotifyTenantCommand } from '../domain/model/notify-tenant.command';
import { TenantNotification } from '../domain/model/tenant-notification.entity';
import { TenantDirectoryFacade } from '../infrastructure/acl/tenant-directory-facade';
import { PROPERTY_COMMUNICATION_REPOSITORY } from '../infrastructure/property-communication.token';
import { TenantNotifier } from './tenant-notifier';

/** Active assignment of a tenant, as other contexts see it. */
export interface ActiveTenantAssignment {
  tenantId: string;
  tenantName: string;
  tenantEmail: string;
  commercialUnitId: string;
  assignedAt: Date;
}

/**
 * IManagementTenantCommunicationFacade: what other bounded contexts may ask of Property
 * Communication without knowing its model. Property Management reads who occupies each store, and
 * Utility Billing can notify a tenant when a bill is issued (`UtilityBillIssued`).
 */
@Injectable({ providedIn: 'root' })
export class ManagementTenantCommunicationFacade {
  private readonly repository = inject(PROPERTY_COMMUNICATION_REPOSITORY);
  private readonly tenantDirectory = inject(TenantDirectoryFacade);
  private readonly notifier = inject(TenantNotifier);

  async activeAssignments(administratorId: string): Promise<ActiveTenantAssignment[]> {
    const [assignments, tenants] = await Promise.all([
      this.repository.listAssignments(administratorId),
      this.tenantDirectory.listTenants(),
    ]);
    const tenantById = new Map(tenants.map((tenant) => [tenant.id, tenant]));
    return assignments
      .filter((assignment) => assignment.isActive)
      .map((assignment) => {
        const tenant = tenantById.get(assignment.tenantId);
        return {
          tenantId: assignment.tenantId,
          tenantName: tenant?.fullName ?? assignment.tenantId,
          tenantEmail: tenant?.email ?? '',
          commercialUnitId: assignment.commercialUnitId,
          assignedAt: assignment.assignedAt,
        };
      });
  }

  notifyTenant(command: NotifyTenantCommand): Promise<TenantNotification> {
    return this.notifier.notify(command);
  }
}
