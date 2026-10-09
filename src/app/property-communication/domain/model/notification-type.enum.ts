/**
 * Reason of a tenant notification. `Announcement` and `Incident` are the communications the
 * administrator publishes (US-34, US-35); the others are sent automatically by the platform.
 */
export enum NotificationType {
  UtilityBillIssued = 'UTILITY_BILL_ISSUED',
  ConversationStarted = 'CONVERSATION_STARTED',
  MessageReceived = 'MESSAGE_RECEIVED',
  AssignmentCreated = 'ASSIGNMENT_CREATED',
  Announcement = 'ANNOUNCEMENT',
  Incident = 'INCIDENT',
}
