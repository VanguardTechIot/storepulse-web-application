import { BaseEntity } from '../../../shared/domain/model/base-entity';
import { CommunicationAction } from './communication-action.enum';
import { NotificationChannel } from './notification-channel.enum';
import { ReferenceType } from './reference-type.enum';

/**
 * Record of a communication with a tenant, kept for traceability and audit (Aggregate Root).
 * The platform registers it when a conversation starts or is resolved and when a notification
 * is delivered; it never changes once registered.
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
}
