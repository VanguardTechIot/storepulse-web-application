/**
 * Tenant that currently occupies a store, translated from Property Communication, where tenant
 * assignments live.
 */
export interface UnitTenant {
  tenantId: string;
  fullName: string;
  email: string;
  assignedAt: Date;
}
