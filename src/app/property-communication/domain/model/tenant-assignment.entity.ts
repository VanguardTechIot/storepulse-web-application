import { BaseEntity } from '../../../shared/domain/model/base-entity';
import { AssignTenantCommand } from './assign-tenant.command';
import { AssignmentStatus } from './assignment-status.enum';
import { CommunicationError, CommunicationErrorCode } from './communication-error';
import { UnitReference } from './unit-reference';

interface TenantAssignmentProps {
  id: string;
  tenantId: string;
  commercialUnitId: string;
  galleryAdministratorId: string;
  status: AssignmentStatus;
  assignedAt: Date;
  terminatedAt: Date | null;
}

/**
 * Assignment of a registered tenant to a store (Aggregate Root). A store never has more than one
 * active assignment, and only a free store can receive one.
 */
export class TenantAssignment implements BaseEntity {
  private readonly props: TenantAssignmentProps;

  constructor(assignment: TenantAssignmentProps) {
    this.props = { ...assignment };
  }

  /**
   * AssignTenantCommand. `unit` comes from Property Management and `assignments` are the ones
   * already registered, to keep a single active assignment per store.
   */
  static assign(
    command: AssignTenantCommand,
    unit: UnitReference,
    assignments: readonly TenantAssignment[],
    now: Date = new Date(),
  ): TenantAssignment {
    const taken = assignments.some(
      (assignment) => assignment.isActive && assignment.commercialUnitId === unit.id,
    );
    if (taken) throw new CommunicationError(CommunicationErrorCode.UnitAlreadyAssigned);
    if (!unit.isStore || !unit.isAvailable) {
      throw new CommunicationError(CommunicationErrorCode.UnitNotAvailable);
    }
    return new TenantAssignment({
      id: '',
      tenantId: command.tenantId,
      commercialUnitId: unit.id,
      galleryAdministratorId: command.galleryAdministratorId,
      status: AssignmentStatus.Active,
      assignedAt: now,
      terminatedAt: null,
    });
  }

  get id(): string {
    return this.props.id;
  }

  get tenantId(): string {
    return this.props.tenantId;
  }

  get commercialUnitId(): string {
    return this.props.commercialUnitId;
  }

  get galleryAdministratorId(): string {
    return this.props.galleryAdministratorId;
  }

  get status(): AssignmentStatus {
    return this.props.status;
  }

  get assignedAt(): Date {
    return this.props.assignedAt;
  }

  get terminatedAt(): Date | null {
    return this.props.terminatedAt;
  }

  get isActive(): boolean {
    return this.props.status === AssignmentStatus.Active;
  }

  /** TerminateTenantAssignmentCommand: the store becomes free again. */
  terminate(now: Date = new Date()): TenantAssignment {
    if (!this.isActive) throw new CommunicationError(CommunicationErrorCode.AssignmentNotActive);
    return new TenantAssignment({
      ...this.props,
      status: AssignmentStatus.Terminated,
      terminatedAt: now,
    });
  }
}
