import { NotificationChannel } from './notification-channel.enum';
import { NotificationType } from './notification-type.enum';

/** Notifies a tenant about something relevant to them. */
export class NotifyTenantCommand {
  readonly tenantId: string;
  readonly commercialUnitId: string | null;
  readonly galleryAdministratorId: string;
  readonly type: NotificationType;
  readonly title: string;
  readonly body: string;
  readonly channel: NotificationChannel;
  readonly referenceId: string | null;

  constructor(command: {
    tenantId: string;
    commercialUnitId: string | null;
    galleryAdministratorId: string;
    type: NotificationType;
    title: string;
    body: string;
    channel: NotificationChannel;
    referenceId?: string | null;
  }) {
    this.tenantId = command.tenantId;
    this.commercialUnitId = command.commercialUnitId;
    this.galleryAdministratorId = command.galleryAdministratorId;
    this.type = command.type;
    this.title = command.title;
    this.body = command.body;
    this.channel = command.channel;
    this.referenceId = command.referenceId ?? null;
  }
}
