import { computed, inject, Injectable, signal } from '@angular/core';
import { CommunicationError, CommunicationErrorCode } from '../domain/model/communication-error';
import { Tenant } from '../domain/model/tenant';
import { UnitReference } from '../domain/model/unit-reference';
import { IamContextFacade } from '../infrastructure/acl/iam-context-facade';
import { PropertyContextFacade } from '../infrastructure/acl/property-context-facade';
import { TenantDirectoryFacade } from '../infrastructure/acl/tenant-directory-facade';

/**
 * Names shown by every Property Communication screen: the registered tenants and the units of the
 * gallery, read from the other contexts through their anti-corruption layers.
 */
@Injectable({ providedIn: 'root' })
export class CommunicationDirectory {
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

  async load(): Promise<string> {
    const administratorId = this.requireAdministrator();
    const [tenants, units] = await Promise.all([
      this.tenantDirectory.listTenants(),
      this.propertyContext.listUnits(administratorId),
    ]);
    this.tenantsState.set(tenants);
    this.unitsState.set(units);
    return administratorId;
  }

  /** Units change when a tenant is assigned or leaves. */
  async reloadUnits(): Promise<void> {
    this.unitsState.set(await this.propertyContext.listUnits(this.requireAdministrator()));
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
