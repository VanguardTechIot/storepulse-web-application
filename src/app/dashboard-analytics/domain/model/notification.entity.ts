import { BaseEntity } from '../../../shared/domain/model/base-entity';
import { NotificationType } from './notification-type.enum';

/**
 * Aggregate root: notification generated automatically from a critical event of another bounded
 * context (Service Execution and Monitoring, Resource and Asset Management, Consumption).
 * Repeated events of the same type are grouped into a single notification (TS-30).
 */
export class Notification implements BaseEntity {
  constructor(
    readonly id: string,
    readonly type: NotificationType,
    /** Device or unit that produced the event (external reference, no physical FK). */
    readonly relatedEntityId: string,
    /** Unit where it happened, e.g. `Local B-12 · Ópticas Visión`. */
    readonly location: string,
    readonly message: string,
    readonly generatedAt: Date,
    readonly read: boolean = false,
    /** Number of events represented: greater than 1 when it groups repeated events. */
    readonly occurrences: number = 1,
  ) {}

  get isGrouped(): boolean {
    return this.occurrences > 1;
  }

  markAsRead(): Notification {
    return this.read
      ? this
      : new Notification(
          this.id,
          this.type,
          this.relatedEntityId,
          this.location,
          this.message,
          this.generatedAt,
          true,
          this.occurrences,
        );
  }

  /** Same kind of event coming from the same device or unit. */
  isRepetitionOf(other: Notification): boolean {
    return this.type === other.type && this.relatedEntityId === other.relatedEntityId;
  }
}
