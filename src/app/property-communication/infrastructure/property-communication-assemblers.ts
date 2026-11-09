import { AssignmentStatus } from '../domain/model/assignment-status.enum';
import { Attachment } from '../domain/model/attachment';
import { CommunicationAction } from '../domain/model/communication-action.enum';
import { CommunicationLog } from '../domain/model/communication-log.entity';
import { Conversation } from '../domain/model/conversation.entity';
import { ConversationStatus } from '../domain/model/conversation-status.enum';
import { Message } from '../domain/model/message.entity';
import { NotificationChannel } from '../domain/model/notification-channel.enum';
import { NotificationStatus } from '../domain/model/notification-status.enum';
import { NotificationType } from '../domain/model/notification-type.enum';
import { NotifyTenantCommand } from '../domain/model/notify-tenant.command';
import { PublishAnnouncementCommand } from '../domain/model/publish-announcement.command';
import { ReferenceType } from '../domain/model/reference-type.enum';
import { SenderRole } from '../domain/model/sender-role.enum';
import { TenantAssignment } from '../domain/model/tenant-assignment.entity';
import { TenantNotification } from '../domain/model/tenant-notification.entity';
import {
  AssignTenantResource,
  CommunicationLogResource,
  ConversationResource,
  MessageResource,
  NotifyTenantResource,
  PublishAnnouncementResource,
  SendMessageResource,
  StartConversationResource,
  TenantAssignmentResource,
  TenantNotificationResource,
} from './property-communication-responses';

function toDate(value: string | null): Date | null {
  return value ? new Date(value) : null;
}

function toId(value: number | null): string | null {
  return value === null ? null : String(value);
}

function toNumber(value: string | null): number | null {
  return value === null ? null : Number(value);
}

export class ConversationAssembler {
  toEntityFromResource(r: ConversationResource): Conversation {
    return new Conversation({
      id: String(r.id),
      tenantId: String(r.tenantId),
      commercialUnitId: toId(r.commercialUnitId),
      galleryAdministratorId: String(r.galleryAdministratorId),
      subject: r.subject,
      status: r.status as ConversationStatus,
      startedAt: new Date(r.startedAt),
      lastMessageAt: new Date(r.lastMessageAt),
      resolvedAt: toDate(r.resolvedAt),
    });
  }

  toRequestFromEntity(e: Conversation): StartConversationResource {
    return { tenantId: Number(e.tenantId), subject: e.subject };
  }
}

export class MessageAssembler {
  toEntityFromResource(r: MessageResource): Message {
    return new Message(
      String(r.id),
      String(r.conversationId),
      String(r.senderId),
      r.senderRole as SenderRole,
      r.content,
      (r.attachments ?? []).map((attachment) => new Attachment(attachment)),
      new Date(r.sentAt),
    );
  }

  toRequestFromEntity(e: Message): SendMessageResource {
    return {
      content: e.content,
      attachments: e.attachments.map(({ fileName, url, mimeType, sizeBytes }) => ({
        fileName,
        url,
        mimeType,
        sizeBytes,
      })),
    };
  }
}

export class TenantNotificationAssembler {
  toEntityFromResource(r: TenantNotificationResource): TenantNotification {
    return new TenantNotification({
      id: String(r.id),
      tenantId: String(r.tenantId),
      commercialUnitId: toId(r.commercialUnitId),
      galleryAdministratorId: String(r.galleryAdministratorId),
      type: r.type as NotificationType,
      title: r.title,
      body: r.body,
      channel: r.channel as NotificationChannel,
      status: r.status as NotificationStatus,
      read: r.read,
      createdAt: new Date(r.createdAt),
      referenceId: toId(r.referenceId),
    });
  }

  toRequestFromCommand(c: NotifyTenantCommand): NotifyTenantResource {
    return {
      tenantId: Number(c.tenantId),
      commercialUnitId: toNumber(c.commercialUnitId),
      type: c.type,
      title: c.title.trim(),
      body: c.body.trim(),
      channel: c.channel,
      referenceId: toNumber(c.referenceId),
    };
  }

  toAnnouncementRequestFromCommand(c: PublishAnnouncementCommand): PublishAnnouncementResource {
    return {
      type: c.type,
      unitIds: c.wholeGallery ? [] : c.unitIds.map(Number),
      wholeGallery: c.wholeGallery,
      title: c.title.trim(),
      body: c.body.trim(),
      channel: c.channel,
    };
  }
}

export class CommunicationLogAssembler {
  toEntityFromResource(r: CommunicationLogResource): CommunicationLog {
    return new CommunicationLog(
      String(r.id),
      String(r.referenceId),
      r.referenceType as ReferenceType,
      r.action as CommunicationAction,
      String(r.tenantId),
      String(r.galleryAdministratorId),
      r.channel as NotificationChannel,
      r.detail,
      new Date(r.loggedAt),
    );
  }
}

export class TenantAssignmentAssembler {
  toEntityFromResource(r: TenantAssignmentResource): TenantAssignment {
    return new TenantAssignment({
      id: String(r.id),
      tenantId: String(r.tenantId),
      commercialUnitId: String(r.commercialUnitId),
      galleryAdministratorId: String(r.galleryAdministratorId),
      status: r.status as AssignmentStatus,
      assignedAt: new Date(r.assignedAt),
      terminatedAt: toDate(r.terminatedAt),
    });
  }

  toRequestFromEntity(e: TenantAssignment): AssignTenantResource {
    return { tenantId: Number(e.tenantId), commercialUnitId: Number(e.commercialUnitId) };
  }
}
