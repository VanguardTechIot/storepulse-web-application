/** What happened in a logged communication; the log detail holds its subject or title. */
export enum CommunicationAction {
  ConversationStarted = 'CONVERSATION_STARTED',
  ConversationResolved = 'CONVERSATION_RESOLVED',
  NotificationSent = 'NOTIFICATION_SENT',
  NotificationFailed = 'NOTIFICATION_FAILED',
}
