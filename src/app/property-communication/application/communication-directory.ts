import { computed, inject, Injectable, signal } from '@angular/core';
import { CommunicationError, CommunicationErrorCode } from '../domain/model/communication-error';
import { Tenant } from '../domain/model/tenant';
import { TenantAssignment } from '../domain/model/tenant-assignment.entity';
import { UnitReference } from '../domain/model/unit-reference';
import { IamContextFacade } from '../infrastructure/acl/iam-context-facade';
import { PropertyContextFacade } from '../infrastructure/acl/property-context-facade';
import { TenantDirectoryFacade } from '../infrastructure/acl/tenant-directory-facade';
import { PROPERTY_COMMUNICATION_REPOSITORY } from '../infrastructure/property-communication.token';

/**
 * Names shown by every Property Communication screen: the tenants of the gallery and its units,
 * read from the other contexts through their anti-corruption layers.
 */
@Injectable({ providedIn: 'root' })
export class CommunicationDirectory {
  private readonly repository = inject(PROPERTY_COMMUNICATION_REPOSITORY);
  private readonly iamContext = inject(IamContextFacade);
  private readonly propertyContext = inject(PropertyContextFacade);
  private readonly tenantDirectory = inject(TenantDirectoryFacade);

  private readonly tenantsState = signal<Tenant[]>([]);
  private readonly unitsState = signal<UnitReference[]>([]);

  readonly tenants = this.tenantsState.asReadonly();
  readonly units = this.unitsState.asReadonly();
  readonly unitsRoute = this.propertyContext.unitsRoute;
  readonly administratorId = this.iamContext.currentAdministratorId;

  private readonly tenantById = computed(
    () => new Map(this.tenantsState().map((tenant) => [tenant.id, tenant])),
  );
  private readonly unitById = computed(
    () => new Map(this.unitsState().map((unit) => [unit.id, unit])),
  );

  /** Reads the tenants and the units; answers the assignments the tenants come from. */
  async load(): Promise<TenantAssignment[]> {
    this.requireAdministrator();
    const [assignments, units] = await Promise.all([
      this.repository.listAssignments(),
      this.propertyContext.listUnits(),
    ]);
    this.tenantsState.set(await this.tenantDirectory.listTenants(assignments));
    this.unitsState.set(units);
    return assignments;
  }

  /** Units change when a tenant is assigned or leaves. */
  async reloadUnits(): Promise<void> {
    this.unitsState.set(await this.propertyContext.listUnits());
  }

  tenant(tenantId: string): Tenant | null {
    return this.tenantById().get(tenantId) ?? null;
  }

  unit(unitId: string | null): UnitReference | null {
    return unitId ? (this.unitById().get(unitId) ?? null) : null;
  }

  tenantName(tenantId: string): string {
    return this.tenant(tenantId)?.fullName ?? tenantId;
  }

  /** `A-03 · Calzados Roma`, or just the code. */
  unitLabel(unitId: string | null): string {
    const unit = this.unit(unitId);
    if (!unit) return '—';
    return unit.businessName ? `${unit.code} · ${unit.businessName}` : unit.code;
  }

  requireAdministrator(): string {
    const administratorId = this.iamContext.currentAdministratorId();
    if (!administratorId) throw new CommunicationError(CommunicationErrorCode.GalleryNotFound);
    return administratorId;
  }
}
