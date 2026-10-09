import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
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
import { ReferenceType } from '../domain/model/reference-type.enum';
import { SenderRole } from '../domain/model/sender-role.enum';
import { TenantAssignment } from '../domain/model/tenant-assignment.entity';
import { TenantNotification } from '../domain/model/tenant-notification.entity';
import {
  CommunicationLogResource,
  ConversationResource,
  MessageResource,
  TenantAssignmentResource,
  TenantNotificationResource,
} from './property-communication-responses';

function toDate(value: string | null): Date | null {
  return value ? new Date(value) : null;
}

export class ConversationAssembler implements BaseAssembler<Conversation, ConversationResource> {
  toEntityFromResource(r: ConversationResource): Conversation {
    return new Conversation({
      id: r.id,
      tenantId: r.tenantId,
      commercialUnitId: r.commercialUnitId,
      galleryAdministratorId: r.galleryAdministratorId,
      subject: r.subject,
      status: r.status as ConversationStatus,
      startedAt: new Date(r.startedAt),
      lastMessageAt: new Date(r.lastMessageAt),
      resolvedAt: toDate(r.resolvedAt),
    });
  }

  toResourceFromEntity(e: Conversation): ConversationResource {
    return {
      id: e.id,
      tenantId: e.tenantId,
      commercialUnitId: e.commercialUnitId,
      galleryAdministratorId: e.galleryAdministratorId,
      subject: e.subject,
      status: e.status,
      startedAt: e.startedAt.toISOString(),
      lastMessageAt: e.lastMessageAt.toISOString(),
      resolvedAt: e.resolvedAt?.toISOString() ?? null,
    };
  }
}

export class MessageAssembler implements BaseAssembler<Message, MessageResource> {
  toEntityFromResource(r: MessageResource): Message {
    return new Message(
      r.id,
      r.conversationId,
      r.senderId,
      r.senderRole as SenderRole,
      r.content,
      (r.attachments ?? []).map((attachment) => new Attachment(attachment)),
      new Date(r.sentAt),
    );
  }

  toResourceFromEntity(e: Message): MessageResource {
    return {
      id: e.id,
      conversationId: e.conversationId,
      senderId: e.senderId,
      senderRole: e.senderRole,
      content: e.content,
      attachments: e.attachments.map(({ fileName, url, mimeType, sizeBytes }) => ({
        fileName,
        url,
        mimeType,
        sizeBytes,
      })),
      sentAt: e.sentAt.toISOString(),
    };
  }
}

export class TenantNotificationAssembler implements BaseAssembler<
  TenantNotification,
  TenantNotificationResource
> {
  toEntityFromResource(r: TenantNotificationResource): TenantNotification {
    return new TenantNotification({
      id: r.id,
      tenantId: r.tenantId,
      commercialUnitId: r.commercialUnitId,
      galleryAdministratorId: r.galleryAdministratorId,
      type: r.type as NotificationType,
      title: r.title,
      body: r.body,
      channel: r.channel as NotificationChannel,
      status: r.status as NotificationStatus,
      read: r.read,
      createdAt: new Date(r.createdAt),
      referenceId: r.referenceId,
    });
  }

  toResourceFromEntity(e: TenantNotification): TenantNotificationResource {
    return {
      id: e.id,
      tenantId: e.tenantId,
      commercialUnitId: e.commercialUnitId,
      galleryAdministratorId: e.galleryAdministratorId,
      type: e.type,
      title: e.title,
      body: e.body,
      channel: e.channel,
      status: e.status,
      read: e.read,
      createdAt: e.createdAt.toISOString(),
      referenceId: e.referenceId,
    };
  }
}

export class CommunicationLogAssembler implements BaseAssembler<
  CommunicationLog,
  CommunicationLogResource
> {
  toEntityFromResource(r: CommunicationLogResource): CommunicationLog {
    return new CommunicationLog(
      r.id,
      r.referenceId,
      r.referenceType as ReferenceType,
      r.action as CommunicationAction,
      r.tenantId,
      r.galleryAdministratorId,
      r.channel as NotificationChannel,
      r.detail,
      new Date(r.loggedAt),
    );
  }

  toResourceFromEntity(e: CommunicationLog): CommunicationLogResource {
    return {
      id: e.id,
      referenceId: e.referenceId,
      referenceType: e.referenceType,
      action: e.action,
      tenantId: e.tenantId,
      galleryAdministratorId: e.galleryAdministratorId,
      channel: e.channel,
      detail: e.detail,
      loggedAt: e.loggedAt.toISOString(),
    };
  }
}

export class TenantAssignmentAssembler implements BaseAssembler<
  TenantAssignment,
  TenantAssignmentResource
> {
  toEntityFromResource(r: TenantAssignmentResource): TenantAssignment {
    return new TenantAssignment({
      id: r.id,
      tenantId: r.tenantId,
      commercialUnitId: r.commercialUnitId,
      galleryAdministratorId: r.galleryAdministratorId,
      status: r.status as AssignmentStatus,
      assignedAt: new Date(r.assignedAt),
      terminatedAt: toDate(r.terminatedAt),
    });
  }

  toResourceFromEntity(e: TenantAssignment): TenantAssignmentResource {
    return {
      id: e.id,
      tenantId: e.tenantId,
      commercialUnitId: e.commercialUnitId,
      galleryAdministratorId: e.galleryAdministratorId,
      status: e.status,
      assignedAt: e.assignedAt.toISOString(),
      terminatedAt: e.terminatedAt?.toISOString() ?? null,
    };
  }
}
