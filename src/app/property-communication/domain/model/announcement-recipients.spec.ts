import { resolveAnnouncementRecipients } from './announcement-recipients';
import { AssignmentStatus } from './assignment-status.enum';
import { TenantAssignment } from './tenant-assignment.entity';
import { UnitReference } from './unit-reference';

describe('resolveAnnouncementRecipients', () => {
  const store = (id: string): UnitReference => ({
    id,
    code: id,
    floor: '1',
    businessName: null,
    isStore: true,
    isAvailable: false,
  });
  const corridor: UnitReference = {
    id: 'unit-cn01',
    code: 'Pasillo norte',
    floor: '1',
    businessName: null,
    isStore: false,
    isAvailable: true,
  };

  const assignment = (
    id: string,
    tenantId: string,
    unitId: string,
    status = AssignmentStatus.Active,
  ) =>
    new TenantAssignment({
      id,
      tenantId,
      commercialUnitId: unitId,
      galleryAdministratorId: 'usr-001',
      status,
      assignedAt: new Date('2026-03-10T15:00:00Z'),
      terminatedAt: null,
    });

  const assignments = [
    assignment('asg-001', 'usr-002', 'unit-a03'),
    assignment('asg-002', 'usr-003', 'unit-a07'),
    assignment('asg-006', 'usr-007', 'unit-c07', AssignmentStatus.Terminated),
  ];

  it('notifies the tenant of each selected store (US-34, scenario 2)', () => {
    const result = resolveAnnouncementRecipients(
      [store('unit-a03'), store('unit-a10')],
      false,
      assignments,
    );

    expect(result.assignments.map((a) => a.tenantId)).toEqual(['usr-002']);
    expect(result.unitsWithoutTenant.map((u) => u.id)).toEqual(['unit-a10']);
  });

  it('notifies every active tenant for a common area or the whole gallery (US-35, scenario 2)', () => {
    expect(resolveAnnouncementRecipients([corridor], false, assignments).assignments).toHaveLength(
      2,
    );
    expect(resolveAnnouncementRecipients([], true, assignments).assignments).toHaveLength(2);
  });
});
