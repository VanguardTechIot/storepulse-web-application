import { AssignTenantCommand } from './assign-tenant.command';
import { AssignmentStatus } from './assignment-status.enum';
import { CommunicationError, CommunicationErrorCode } from './communication-error';
import { TenantAssignment } from './tenant-assignment.entity';
import { UnitReference } from './unit-reference';

describe('TenantAssignment', () => {
  const freeStore: UnitReference = {
    id: 'unit-a10',
    code: 'A-10',
    floor: '1',
    businessName: null,
    isStore: true,
    isAvailable: true,
  };
  const command = new AssignTenantCommand({
    tenantId: 'usr-007',
    commercialUnitId: 'unit-a10',
    galleryAdministratorId: 'usr-001',
  });

  function errorOf(change: () => unknown): CommunicationErrorCode | null {
    try {
      change();
      return null;
    } catch (error) {
      return error instanceof CommunicationError ? error.code : null;
    }
  }

  it('assigns a tenant to a free store', () => {
    const assignment = TenantAssignment.assign(command, freeStore, []);

    expect(assignment.status).toBe(AssignmentStatus.Active);
    expect(assignment.commercialUnitId).toBe('unit-a10');
  });

  it('keeps a single active assignment per store', () => {
    const active = TenantAssignment.assign(command, freeStore, []);

    expect(errorOf(() => TenantAssignment.assign(command, freeStore, [active]))).toBe(
      CommunicationErrorCode.UnitAlreadyAssigned,
    );
    expect(TenantAssignment.assign(command, freeStore, [active.terminate()]).isActive).toBe(true);
  });

  it('refuses occupied stores and common areas', () => {
    expect(
      errorOf(() => TenantAssignment.assign(command, { ...freeStore, isAvailable: false }, [])),
    ).toBe(CommunicationErrorCode.UnitNotAvailable);
    expect(
      errorOf(() => TenantAssignment.assign(command, { ...freeStore, isStore: false }, [])),
    ).toBe(CommunicationErrorCode.UnitNotAvailable);
  });

  it('terminates only once', () => {
    const terminated = TenantAssignment.assign(command, freeStore, []).terminate(
      new Date('2026-10-08T15:00:00Z'),
    );

    expect(terminated.status).toBe(AssignmentStatus.Terminated);
    expect(terminated.terminatedAt?.toISOString()).toBe('2026-10-08T15:00:00.000Z');
    expect(errorOf(() => terminated.terminate())).toBe(CommunicationErrorCode.AssignmentNotActive);
  });
});
