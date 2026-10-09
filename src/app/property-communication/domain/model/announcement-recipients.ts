import { TenantAssignment } from './tenant-assignment.entity';
import { UnitReference } from './unit-reference';

export interface AnnouncementRecipients {
  /** Active assignments whose tenant receives the communication. */
  assignments: TenantAssignment[];
  /** Selected stores without a tenant: nobody receives it there. */
  unitsWithoutTenant: UnitReference[];
}

/**
 * Domain service that decides who receives a communication of the administrator (US-34, US-35).
 *
 * - Sent to the whole gallery, or about a common area: every tenant with an active assignment
 *   (US-35, scenario 2).
 * - Sent to some stores: the tenant of each one (US-34, scenario 2).
 */
export function resolveAnnouncementRecipients(
  selectedUnits: readonly UnitReference[],
  wholeGallery: boolean,
  assignments: readonly TenantAssignment[],
): AnnouncementRecipients {
  const active = assignments.filter((assignment) => assignment.isActive);
  if (wholeGallery || selectedUnits.some((unit) => !unit.isStore)) {
    return { assignments: active, unitsWithoutTenant: [] };
  }
  const byUnit = new Map(active.map((assignment) => [assignment.commercialUnitId, assignment]));
  return {
    assignments: selectedUnits
      .map((unit) => byUnit.get(unit.id))
      .filter((assignment): assignment is TenantAssignment => assignment !== undefined),
    unitsWithoutTenant: selectedUnits.filter((unit) => !byUnit.has(unit.id)),
  };
}
