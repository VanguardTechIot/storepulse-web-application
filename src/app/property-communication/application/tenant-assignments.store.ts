import { computed, inject, Injectable, signal } from '@angular/core';
import { TranslationService } from '../../shared/infrastructure/i18n/translation.service';
import { AssignTenantCommand } from '../domain/model/assign-tenant.command';
import { CommunicationError, CommunicationErrorCode } from '../domain/model/communication-error';
import { NotificationChannel } from '../domain/model/notification-channel.enum';
import { NotificationType } from '../domain/model/notification-type.enum';
import { NotifyTenantCommand } from '../domain/model/notify-tenant.command';
import { TenantAssignment } from '../domain/model/tenant-assignment.entity';
import { PropertyContextFacade } from '../infrastructure/acl/property-context-facade';
import { PROPERTY_COMMUNICATION_REPOSITORY } from '../infrastructure/property-communication.token';
import { CommunicationDirectory } from './communication-directory';
import { runOperation } from './run-operation';
import { TenantNotifier } from './tenant-notifier';

/**
 * Application service of the assignments of registered tenants to stores. Assigning occupies the
 * store in Property Management and terminating frees it.
 */
@Injectable({ providedIn: 'root' })
export class TenantAssignmentsStore {
  private readonly repository = inject(PROPERTY_COMMUNICATION_REPOSITORY);
  private readonly propertyContext = inject(PropertyContextFacade);
  private readonly notifier = inject(TenantNotifier);
  private readonly i18n = inject(TranslationService);
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
      const administratorId = await this.directory.load();
      this.assignmentsState.set(await this.repository.listAssignments(administratorId));
    });
  }

  /** AssignTenantCommand: the tenant is notified of the new store. */
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
      await this.propertyContext.occupyUnit(unit.id);
      let saved: TenantAssignment;
      try {
        saved = await this.repository.assignTenant(assignment);
      } catch (error) {
        await this.propertyContext.vacateUnit(unit.id).catch(() => undefined);
        throw error;
      }
      this.assignmentsState.update((items) => [saved, ...items]);
      await this.directory.reloadUnits();
      const label = this.directory.unitLabel(unit.id);
      await this.notifier.notify(
        new NotifyTenantCommand({
          tenantId,
          commercialUnitId: unit.id,
          galleryAdministratorId: administratorId,
          type: NotificationType.AssignmentCreated,
          title: this.i18n.t('communication.auto.assignment_title', { unit: unit.code }),
          body: this.i18n.t('communication.auto.assignment_body', { unit: label }),
          channel: NotificationChannel.Email,
          referenceId: saved.id,
        }),
      );
    });
  }

  /** TerminateTenantAssignmentCommand: the store becomes free again. */
  terminate(assignmentId: string): Promise<boolean> {
    return runOperation(this.saving, this.error, async () => {
      const current = this.assignmentsState().find((a) => a.id === assignmentId);
      if (!current) throw new CommunicationError(CommunicationErrorCode.AssignmentNotActive);
      const terminated = await this.repository.terminateAssignment(current.terminate());
      this.assignmentsState.update((items) =>
        items.map((item) => (item.id === terminated.id ? terminated : item)),
      );
      await this.propertyContext.vacateUnit(terminated.commercialUnitId);
      await this.directory.reloadUnits();
    });
  }

  clearError(): void {
    this.error.set(null);
  }
}
