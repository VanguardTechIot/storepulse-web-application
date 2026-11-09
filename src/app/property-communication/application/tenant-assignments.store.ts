import { computed, inject, Injectable, signal } from '@angular/core';
import { AssignTenantCommand } from '../domain/model/assign-tenant.command';
import { CommunicationError, CommunicationErrorCode } from '../domain/model/communication-error';
import { TenantAssignment } from '../domain/model/tenant-assignment.entity';
import { PROPERTY_COMMUNICATION_REPOSITORY } from '../infrastructure/property-communication.token';
import { CommunicationDirectory } from './communication-directory';
import { runOperation } from './run-operation';

/**
 * Application service of the assignments of registered tenants to stores. The platform occupies
 * the store and notifies the tenant on assignment, and frees the store on termination.
 */
@Injectable({ providedIn: 'root' })
export class TenantAssignmentsStore {
  private readonly repository = inject(PROPERTY_COMMUNICATION_REPOSITORY);
  readonly directory = inject(CommunicationDirectory);

  private readonly assignmentsState = signal<TenantAssignment[]>([]);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<CommunicationErrorCode | null>(null);

  /** Active assignments first, then the most recent. */
  readonly assignments = computed(() =>
    [...this.assignmentsState()].sort(
      (a, b) =>
        Number(b.isActive) - Number(a.isActive) || b.assignedAt.getTime() - a.assignedAt.getTime(),
    ),
  );
  readonly activeCount = computed(() => this.assignmentsState().filter((a) => a.isActive).length);

  /** Stores that can receive a tenant now. */
  readonly availableUnits = computed(() =>
    this.directory.units().filter((unit) => unit.isStore && unit.isAvailable),
  );

  load(): Promise<boolean> {
    return runOperation(this.loading, this.error, async () => {
      this.assignmentsState.set(await this.directory.load());
    });
  }

  /** AssignTenantCommand. */
  assign(tenantId: string, commercialUnitId: string): Promise<boolean> {
    return runOperation(this.saving, this.error, async () => {
      const administratorId = this.directory.requireAdministrator();
      const unit = this.directory.unit(commercialUnitId);
      if (!unit) throw new CommunicationError(CommunicationErrorCode.UnitNotFound);
      if (!this.directory.tenant(tenantId)) {
        throw new CommunicationError(CommunicationErrorCode.TenantNotFound);
      }
      const assignment = TenantAssignment.assign(
        new AssignTenantCommand({
          tenantId,
          commercialUnitId,
          galleryAdministratorId: administratorId,
        }),
        unit,
        this.assignmentsState(),
      );
      const saved = await this.repository.assignTenant(assignment);
      this.assignmentsState.update((items) => [saved, ...items]);
      await this.directory.reloadUnits();
    });
  }

  /** TerminateTenantAssignmentCommand: the store becomes free again. */
  terminate(assignmentId: string): Promise<boolean> {
    return runOperation(this.saving, this.error, async () => {
      const current = this.assignmentsState().find((a) => a.id === assignmentId);
      if (!current) throw new CommunicationError(CommunicationErrorCode.AssignmentNotActive);
      current.terminate();
      const terminated = await this.repository.terminateAssignment(current.id);
      this.assignmentsState.update((items) =>
        items.map((item) => (item.id === terminated.id ? terminated : item)),
      );
      await this.directory.reloadUnits();
    });
  }

  clearError(): void {
    this.error.set(null);
  }
}
