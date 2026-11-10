import { CommunicationLog } from '../model/communication-log.entity';
import { Conversation } from '../model/conversation.entity';
import { Message } from '../model/message.entity';
import { NotifyTenantCommand } from '../model/notify-tenant.command';
import { PublishAnnouncementCommand } from '../model/publish-announcement.command';
import { Tenant } from '../model/tenant';
import { TenantAssignment } from '../model/tenant-assignment.entity';
import { TenantNotification } from '../model/tenant-notification.entity';

/**
 * Access abstraction of the Property Communication context. Mirrors its controllers:
 * `/conversations`, `/conversations/{id}/messages`, `/tenant-notifications`, `/communication-logs`
 * and `/tenant-assignments`, which answer only what belongs to the signed-in administrator.
 * Business errors are thrown as `CommunicationError`.
 */
export interface PropertyCommunicationRepository {
  listConversations(): Promise<Conversation[]>;
  getConversation(conversationId: string): Promise<Conversation>;
  /** The platform links the store of the tenant's active assignment and logs the start. */
  startConversation(conversation: Conversation): Promise<Conversation>;
  /** The platform logs the resolution. */
  resolveConversation(conversationId: string): Promise<Conversation>;

  listMessages(conversationId: string): Promise<Message[]>;
  /** The platform also moves the date of the last message of the conversation. */
  sendMessage(message: Message): Promise<Message>;

  listNotifications(): Promise<TenantNotification[]>;
  /** The platform delivers the notification and logs the delivery. */
  notifyTenant(command: NotifyTenantCommand): Promise<TenantNotification>;
  /** One notification for each tenant assigned to the chosen stores, or to the whole gallery. */
  publishAnnouncement(command: PublishAnnouncementCommand): Promise<TenantNotification[]>;
  retryNotification(notificationId: string): Promise<TenantNotification>;

  listLogs(): Promise<CommunicationLog[]>;

  listAssignments(): Promise<TenantAssignment[]>;
  /** Tenants that have been assigned to a store of the gallery, with the name of their profile. */
  listTenants(): Promise<Tenant[]>;
  /** The platform occupies the store and notifies the tenant. */
  assignTenant(assignment: TenantAssignment): Promise<TenantAssignment>;
  /** The platform frees the store. */
  terminateAssignment(assignmentId: string): Promise<TenantAssignment>;
}
