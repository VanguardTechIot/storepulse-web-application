/**
 * Business outcomes that prevent a Property Communication operation from completing.
 * The value doubles as the i18n key suffix (`communication.errors.<code>`).
 */
export enum CommunicationErrorCode {
  InvalidSubject = 'invalid_subject',
  InvalidMessageContent = 'invalid_message_content',
  InvalidAttachment = 'invalid_attachment',
  AttachmentTooLarge = 'attachment_too_large',
  ConversationResolved = 'conversation_resolved',
  ConversationNotFound = 'conversation_not_found',
  TenantNotFound = 'tenant_not_found',
  UnitNotFound = 'unit_not_found',
  UnitNotAvailable = 'unit_not_available',
  UnitAlreadyAssigned = 'unit_already_assigned',
  AssignmentNotActive = 'assignment_not_active',
  InvalidNotificationTitle = 'invalid_notification_title',
  InvalidNotificationBody = 'invalid_notification_body',
  NoRecipients = 'no_recipients',
  NotificationNotFailed = 'notification_not_failed',
  GalleryNotFound = 'gallery_not_found',
  Unexpected = 'unexpected',
}

export class CommunicationError extends Error {
  constructor(readonly code: CommunicationErrorCode) {
    super(code);
    this.name = 'CommunicationError';
  }
}
