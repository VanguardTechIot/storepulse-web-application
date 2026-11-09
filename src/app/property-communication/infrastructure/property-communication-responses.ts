/** Conversation, as `GET /conversations/{id}` returns it. Dates are ISO-8601. */
export interface ConversationResource {
  id: number;
  tenantId: number;
  commercialUnitId: number | null;
  galleryAdministratorId: number;
  subject: string;
  status: 'OPEN' | 'RESOLVED';
  startedAt: string;
  lastMessageAt: string;
  resolvedAt: string | null;
}

/** Body of `POST /conversations`: the platform links the unit of the tenant's assignment. */
export interface StartConversationResource {
  tenantId: number;
  subject: string;
}

export interface AttachmentResource {
  fileName: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
}

/** Message, as `GET /conversations/{id}/messages` returns it. */
export interface MessageResource {
  id: number;
  conversationId: number;
  senderId: number;
  senderRole: 'TENANT' | 'GALLERY_ADMINISTRATOR';
  content: string;
  attachments: AttachmentResource[];
  sentAt: string;
}

/** Body of `POST /conversations/{id}/messages`; the sender is the signed-in user. */
export interface SendMessageResource {
  content: string;
  attachments: AttachmentResource[];
}

export interface TenantNotificationResource {
  id: number;
  tenantId: number;
  commercialUnitId: number | null;
  galleryAdministratorId: number;
  type: string;
  title: string;
  body: string;
  channel: 'IN_APP' | 'EMAIL' | 'PUSH';
  status: 'PENDING' | 'SENT' | 'FAILED';
  read: boolean;
  createdAt: string;
  referenceId: number | null;
}

/** Body of `POST /tenant-notifications`: the platform delivers it and logs the delivery. */
export interface NotifyTenantResource {
  tenantId: number;
  commercialUnitId: number | null;
  type: string;
  title: string;
  body: string;
  channel: string;
  referenceId: number | null;
}

/** Body of `POST /tenant-notifications/announcements`: one notification per assigned tenant. */
export interface PublishAnnouncementResource {
  type: string;
  unitIds: number[];
  wholeGallery: boolean;
  title: string;
  body: string;
  channel: string;
}

export interface CommunicationLogResource {
  id: number;
  referenceId: number;
  referenceType: 'NOTIFICATION' | 'CONVERSATION';
  action: string;
  tenantId: number;
  galleryAdministratorId: number;
  channel: 'IN_APP' | 'EMAIL' | 'PUSH';
  detail: string;
  loggedAt: string;
}

export interface TenantAssignmentResource {
  id: number;
  tenantId: number;
  /** Name and email of the tenant's profile; null when the tenant has no profile yet. */
  tenantFullName: string | null;
  tenantEmail: string | null;
  commercialUnitId: number;
  galleryAdministratorId: number;
  status: 'ACTIVE' | 'TERMINATED';
  assignedAt: string;
  terminatedAt: string | null;
}

/** Body of `POST /tenant-assignments`: the platform occupies the store and notifies the tenant. */
export interface AssignTenantResource {
  tenantId: number;
  commercialUnitId: number;
}
