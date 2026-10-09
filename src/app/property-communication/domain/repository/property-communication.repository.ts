import { CommunicationLog } from '../model/communication-log.entity';
import { Conversation } from '../model/conversation.entity';
import { Message } from '../model/message.entity';
import { TenantAssignment } from '../model/tenant-assignment.entity';
import { TenantNotification } from '../model/tenant-notification.entity';

/**
 * Access abstraction of the Property Communication context. Mirrors its controllers:
 * `/conversations`, `/conversations/{id}/messages`, `/tenant-notifications`, `/communication-logs`
 * and `/tenant-assignments`. Business errors are thrown as `CommunicationError`.
 */
export interface PropertyCommunicationRepository {
  listConversations(administratorId: string): Promise<Conversation[]>;
  getConversation(conversationId: string): Promise<Conversation>;
  startConversation(conversation: Conversation): Promise<Conversation>;
  /** Saves the date of the last message. */
  updateConversation(conversation: Conversation): Promise<Conversation>;
  resolveConversation(conversation: Conversation): Promise<Conversation>;

  listMessages(conversationId: string): Promise<Message[]>;
  sendMessage(message: Message): Promise<Message>;

  listNotifications(administratorId: string): Promise<TenantNotification[]>;
  createNotification(notification: TenantNotification): Promise<TenantNotification>;
  updateNotification(notification: TenantNotification): Promise<TenantNotification>;

  listLogs(administratorId: string): Promise<CommunicationLog[]>;
  registerLog(log: CommunicationLog): Promise<CommunicationLog>;

  listAssignments(administratorId: string): Promise<TenantAssignment[]>;
  assignTenant(assignment: TenantAssignment): Promise<TenantAssignment>;
  terminateAssignment(assignment: TenantAssignment): Promise<TenantAssignment>;
}
