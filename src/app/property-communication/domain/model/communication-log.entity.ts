import { BaseEntity } from '../../../shared/domain/model/base-entity';
import { CommunicationAction } from './communication-action.enum';
import { NotificationChannel } from './notification-channel.enum';
import { ReferenceType } from './reference-type.enum';
import { RegisterCommunicationLogCommand } from './register-communication-log.command';

/**
 * Record of a communication with a tenant, kept for traceability and audit (Aggregate Root).
 * It never changes once registered.
 */
export class CommunicationLog implements BaseEntity {
  constructor(
    readonly id: string,
    readonly referenceId: string,
    readonly referenceType: ReferenceType,
    readonly action: CommunicationAction,
    readonly tenantId: string,
    readonly galleryAdministratorId: string,
    readonly channel: NotificationChannel,
    /** Subject of the conversation or title of the notification. */
    readonly detail: string,
    readonly loggedAt: Date,
  ) {}

  /** RegisterCommunicationLogCommand: the log gets its id when saved. */
  static register(
    command: RegisterCommunicationLogCommand,
    now: Date = new Date(),
  ): CommunicationLog {
    return new CommunicationLog(
      '',
      command.referenceId,
      command.referenceType,
      command.action,
      command.tenantId,
      command.galleryAdministratorId,
      command.channel,
      command.detail.trim(),
      now,
    );
  }
}
