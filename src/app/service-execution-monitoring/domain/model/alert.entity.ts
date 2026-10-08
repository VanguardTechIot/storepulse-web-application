import { BaseEntity } from '../../../shared/domain/model/base-entity';

/**
 * Alert lifecycle: ACTIVE → ACKNOWLEDGED → RESOLVED.
 */
export type AlertStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';

export const ALERT_STATUSES: readonly AlertStatus[] = ['ACTIVE', 'ACKNOWLEDGED', 'RESOLVED'];

export class AlertTransitionError extends Error {
  constructor(
    readonly currentStatus: AlertStatus,
    readonly attempted: 'acknowledge' | 'resolve',
  ) {
    super(`Cannot ${attempted} an alert in status ${currentStatus}`);
  }
}

/**
 * Aggregate root: condition detected by a monitoring rule over a measurement.
 */
export class Alert implements BaseEntity {
  constructor(
    readonly id: string,
    readonly ruleId: string,
    readonly measurementId: string,
    readonly status: AlertStatus,
    readonly createdAt: Date,
    readonly acknowledgedAt: Date | null,
    readonly resolvedAt: Date | null,
    readonly resolutionNote: string | null,
  ) {}

  get canAcknowledge(): boolean {
    return this.status === 'ACTIVE';
  }

  get canResolve(): boolean {
    return this.status === 'ACKNOWLEDGED';
  }

  get isOpen(): boolean {
    return this.status !== 'RESOLVED';
  }

  /** Time between detection and acknowledgement, kept once the alert is resolved. */
  get responseTimeMs(): number | null {
    return this.acknowledgedAt ? this.acknowledgedAt.getTime() - this.createdAt.getTime() : null;
  }

  /** Confirms that the alert is being attended. Only an ACTIVE alert can be acknowledged. */
  acknowledge(at: Date = new Date()): Alert {
    if (!this.canAcknowledge) throw new AlertTransitionError(this.status, 'acknowledge');
    return new Alert(this.id, this.ruleId, this.measurementId, 'ACKNOWLEDGED', this.createdAt, at, null, null);
  }

  /** Records the result of the attention. Only an ACKNOWLEDGED alert can be resolved. */
  resolve(resolutionNote: string, at: Date = new Date()): Alert {
    if (!this.canResolve) throw new AlertTransitionError(this.status, 'resolve');
    return new Alert(
      this.id,
      this.ruleId,
      this.measurementId,
      'RESOLVED',
      this.createdAt,
      this.acknowledgedAt,
      at,
      resolutionNote.trim(),
    );
  }
}
