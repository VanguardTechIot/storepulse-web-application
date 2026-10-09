import { inject, Injectable } from '@angular/core';
import { CommunicationAction } from '../domain/model/communication-action.enum';
import { CommunicationLog } from '../domain/model/communication-log.entity';
import { Conversation } from '../domain/model/conversation.entity';
import { NotificationChannel } from '../domain/model/notification-channel.enum';
import { NotifyTenantCommand } from '../domain/model/notify-tenant.command';
import { ReferenceType } from '../domain/model/reference-type.enum';
import { RegisterCommunicationLogCommand } from '../domain/model/register-communication-log.command';
import { TenantNotification } from '../domain/model/tenant-notification.entity';
import { PROPERTY_COMMUNICATION_REPOSITORY } from '../infrastructure/property-communication.token';

/**
 * Command handlers of tenant notifications and communication logs, shared by the screens of this
 * context and by the facade other contexts use.
 *
 * NotifyTenantCommand saves the notification as pending and delivers it; the delivery
 * (TenantNotifiedEvent) registers its communication log. There is no email or push provider in
 * local development, so every delivery succeeds.
 */
@Injectable({ providedIn: 'root' })
export class TenantNotifier {
  private readonly repository = inject(PROPERTY_COMMUNICATION_REPOSITORY);

  async notify(command: NotifyTenantCommand): Promise<TenantNotification> {
    const pending = await this.repository.createNotification(TenantNotification.create(command));
    return this.deliver(pending);
  }

  /** Delivers again a notification that failed. */
  async retry(notification: TenantNotification): Promise<TenantNotification> {
    const pending = await this.repository.updateNotification(notification.retry());
    return this.deliver(pending);
  }

  /** Records that a conversation started or was resolved. */
  async logConversation(conversation: Conversation, action: CommunicationAction): Promise<void> {
    await this.log(
      new RegisterCommunicationLogCommand({
        referenceId: conversation.id,
        referenceType: ReferenceType.Conversation,
        action,
        tenantId: conversation.tenantId,
        galleryAdministratorId: conversation.galleryAdministratorId,
        channel: NotificationChannel.InApp,
        detail: conversation.subject,
      }),
    );
  }

  private async deliver(pending: TenantNotification): Promise<TenantNotification> {
    const sent = await this.repository.updateNotification(pending.markSent());
    await this.log(
      new RegisterCommunicationLogCommand({
        referenceId: sent.id,
        referenceType: ReferenceType.Notification,
        action: CommunicationAction.NotificationSent,
        tenantId: sent.tenantId,
        galleryAdministratorId: sent.galleryAdministratorId,
        channel: sent.channel,
        detail: sent.title,
      }),
    );
    return sent;
  }

  /** RegisterCommunicationLogCommand. */
  private async log(command: RegisterCommunicationLogCommand): Promise<void> {
    await this.repository.registerLog(CommunicationLog.register(command));
  }
}
