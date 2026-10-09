import { BaseResource } from '../../shared/infrastructure/base-response';

/** Conversation, as `GET /conversations/{id}` returns it. Dates are ISO-8601. */
export interface ConversationResource extends BaseResource {
  tenantId: string;
  commercialUnitId: string | null;
  galleryAdministratorId: string;
  subject: string;
  status: 'OPEN' | 'RESOLVED';
  startedAt: string;
  lastMessageAt: string;
  resolvedAt: string | null;
}

export interface AttachmentResource {
  fileName: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
}

/** Message, as `GET /conversations/{id}/messages` returns it. */
export interface MessageResource extends BaseResource {
  conversationId: string;
  senderId: string;
  senderRole: 'TENANT' | 'GALLERY_ADMINISTRATOR';
  content: string;
  attachments: AttachmentResource[];
  sentAt: string;
}

export interface TenantNotificationResource extends BaseResource {
  tenantId: string;
  commercialUnitId: string | null;
  galleryAdministratorId: string;
  type: string;
  title: string;
  body: string;
  channel: 'IN_APP' | 'EMAIL' | 'PUSH';
  status: 'PENDING' | 'SENT' | 'FAILED';
  read: boolean;
  createdAt: string;
  referenceId: string | null;
}

export interface CommunicationLogResource extends BaseResource {
  referenceId: string;
  referenceType: 'NOTIFICATION' | 'CONVERSATION';
  action: string;
  tenantId: string;
  galleryAdministratorId: string;
  channel: 'IN_APP' | 'EMAIL' | 'PUSH';
  detail: string;
  loggedAt: string;
}

export interface TenantAssignmentResource extends BaseResource {
  tenantId: string;
  commercialUnitId: string;
  galleryAdministratorId: string;
  status: 'ACTIVE' | 'TERMINATED';
  assignedAt: string;
  terminatedAt: string | null;
}
