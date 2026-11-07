import { BaseEntity } from '../../../shared/domain/model/base-entity';
import { AlertStatus } from '../enums/alert-status.enum';
import { SensorType } from '../enums/sensor-type.enum';
import { AnalyticsError, AnalyticsErrorCode } from './analytics-error';

/** Longest resolution note accepted by the platform. */
export const RESOLUTION_NOTE_MAX_LENGTH = 255;

export interface AlertProps {
  id: string;
  deviceId: string;
  sensorType: SensorType;
  measuredValue: number;
  status: AlertStatus;
  detectedAt: Date;
  acknowledgedAt: Date | null;
  resolvedAt: Date | null;
  resolutionNote: string | null;
}

/**
 * Alert raised by a measurement that broke a safety rule. It moves from active to acknowledged
 * and then to resolved, always in that order.
 */
export class Alert implements BaseEntity {
  private constructor(private readonly props: AlertProps) {}

  static restore(props: AlertProps): Alert {
    return new Alert({ ...props });
  }

  get id(): string {
    return this.props.id;
  }
  get deviceId(): string {
    return this.props.deviceId;
  }
  get sensorType(): SensorType {
    return this.props.sensorType;
  }
  get measuredValue(): number {
    return this.props.measuredValue;
  }
  get status(): AlertStatus {
    return this.props.status;
  }
  get detectedAt(): Date {
    return this.props.detectedAt;
  }
  get acknowledgedAt(): Date | null {
    return this.props.acknowledgedAt;
  }
  get resolvedAt(): Date | null {
    return this.props.resolvedAt;
  }
  get resolutionNote(): string | null {
    return this.props.resolutionNote;
  }

  /** Active or acknowledged: still needs attention. */
  get isOpen(): boolean {
    return this.props.status !== AlertStatus.Resolved;
  }

  acknowledge(at: Date = new Date()): Alert {
    if (this.props.status !== AlertStatus.Active) {
      throw new AnalyticsError(AnalyticsErrorCode.AlertCannotBeAcknowledged);
    }
    return new Alert({ ...this.props, status: AlertStatus.Acknowledged, acknowledgedAt: at });
  }

  resolve(note: string, at: Date = new Date()): Alert {
    if (this.props.status !== AlertStatus.Acknowledged) {
      throw new AnalyticsError(AnalyticsErrorCode.AlertCannotBeResolved);
    }
    const resolutionNote = note.trim();
    if (!resolutionNote || resolutionNote.length > RESOLUTION_NOTE_MAX_LENGTH) {
      throw new AnalyticsError(AnalyticsErrorCode.InvalidResolutionNote);
    }
    return new Alert({
      ...this.props,
      status: AlertStatus.Resolved,
      resolvedAt: at,
      resolutionNote,
    });
  }
}
