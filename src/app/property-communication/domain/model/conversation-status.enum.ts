/** Lifecycle of a conversation: no messages can be sent once it is resolved. */
export enum ConversationStatus {
  Open = 'OPEN',
  Resolved = 'RESOLVED',
}
