import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { ApiError } from '../../../shared/domain/model/api-error';
import { sendRequest } from '../../../shared/infrastructure/send-request';
import { CommunicationError, CommunicationErrorCode } from '../../domain/model/communication-error';
import { CommunicationLog } from '../../domain/model/communication-log.entity';
import { Conversation } from '../../domain/model/conversation.entity';
import { Message } from '../../domain/model/message.entity';
import { NotifyTenantCommand } from '../../domain/model/notify-tenant.command';
import { PublishAnnouncementCommand } from '../../domain/model/publish-announcement.command';
import { Tenant } from '../../domain/model/tenant';
import { TenantAssignment } from '../../domain/model/tenant-assignment.entity';
import { TenantNotification } from '../../domain/model/tenant-notification.entity';
import { PropertyCommunicationRepository } from '../../domain/repository/property-communication.repository';
import {
  CommunicationLogAssembler,
  ConversationAssembler,
  MessageAssembler,
  TenantAssembler,
  TenantAssignmentAssembler,
  TenantNotificationAssembler,
} from '../property-communication-assemblers';
import {
  CommunicationLogResource,
  ConversationResource,
  MessageResource,
  TenantAssignmentResource,
  TenantNotificationResource,
} from '../property-communication-responses';

const apiUrl = environment.platformProviderApiBaseUrl;
const conversationsUrl = `${apiUrl}${environment.platformProviderConversationsEndpointPath}`;
const notificationsUrl = `${apiUrl}${environment.platformProviderTenantNotificationsEndpointPath}`;
const logsUrl = `${apiUrl}${environment.platformProviderCommunicationLogsEndpointPath}`;
const assignmentsUrl = `${apiUrl}${environment.platformProviderTenantAssignmentsEndpointPath}`;

const codes = new Set<string>(Object.values(CommunicationErrorCode));

/** The REST API answers the business code in `message`; anything else stays unexpected. */
const failed = (error: ApiError) =>
  new CommunicationError(
    codes.has(error.message)
      ? (error.message as CommunicationErrorCode)
      : CommunicationErrorCode.Unexpected,
  );

function conversationUrl(conversationId: string, path = ''): string {
  return `${conversationsUrl}/${encodeURIComponent(conversationId)}${path}`;
}

/**
 * HTTP implementation of the repository over the StorePulse REST API. The platform registers the
 * communication logs and the side effects on the stores; this class only sends the commands.
 */
export class HttpPropertyCommunicationRepository implements PropertyCommunicationRepository {
  private readonly http = inject(HttpClient);
  private readonly conversationAssembler = new ConversationAssembler();
  private readonly messageAssembler = new MessageAssembler();
  private readonly notificationAssembler = new TenantNotificationAssembler();
  private readonly logAssembler = new CommunicationLogAssembler();
  private readonly assignmentAssembler = new TenantAssignmentAssembler();
  private readonly tenantAssembler = new TenantAssembler();

  // ---------- Conversations ----------
  async listConversations(): Promise<Conversation[]> {
    const items = await sendRequest(
      this.http.get<ConversationResource[]>(conversationsUrl),
      failed,
    );
    return items.map((item) => this.conversationAssembler.toEntityFromResource(item));
  }

  async getConversation(conversationId: string): Promise<Conversation> {
    const item = await sendRequest(
      this.http.get<ConversationResource>(conversationUrl(conversationId)),
      failed,
    );
    return this.conversationAssembler.toEntityFromResource(item);
  }

  async startConversation(conversation: Conversation): Promise<Conversation> {
    const item = await sendRequest(
      this.http.post<ConversationResource>(
        conversationsUrl,
        this.conversationAssembler.toRequestFromEntity(conversation),
      ),
      failed,
    );
    return this.conversationAssembler.toEntityFromResource(item);
  }

  async resolveConversation(conversationId: string): Promise<Conversation> {
    const item = await sendRequest(
      this.http.patch<ConversationResource>(conversationUrl(conversationId, '/resolve'), null),
      failed,
    );
    return this.conversationAssembler.toEntityFromResource(item);
  }

  // ---------- Messages ----------
  async listMessages(conversationId: string): Promise<Message[]> {
    const items = await sendRequest(
      this.http.get<MessageResource[]>(conversationUrl(conversationId, '/messages')),
      failed,
    );
    return items.map((item) => this.messageAssembler.toEntityFromResource(item));
  }

  async sendMessage(message: Message): Promise<Message> {
    const item = await sendRequest(
      this.http.post<MessageResource>(
        conversationUrl(message.conversationId, '/messages'),
        this.messageAssembler.toRequestFromEntity(message),
      ),
      failed,
    );
    return this.messageAssembler.toEntityFromResource(item);
  }

  // ---------- Notifications ----------
  async listNotifications(): Promise<TenantNotification[]> {
    const items = await sendRequest(
      this.http.get<TenantNotificationResource[]>(notificationsUrl),
      failed,
    );
    return items.map((item) => this.notificationAssembler.toEntityFromResource(item));
  }

  async notifyTenant(command: NotifyTenantCommand): Promise<TenantNotification> {
    const item = await sendRequest(
      this.http.post<TenantNotificationResource>(
        notificationsUrl,
        this.notificationAssembler.toRequestFromCommand(command),
      ),
      failed,
    );
    return this.notificationAssembler.toEntityFromResource(item);
  }

  async publishAnnouncement(command: PublishAnnouncementCommand): Promise<TenantNotification[]> {
    const items = await sendRequest(
      this.http.post<TenantNotificationResource[]>(
        `${notificationsUrl}/announcements`,
        this.notificationAssembler.toAnnouncementRequestFromCommand(command),
      ),
      failed,
    );
    return items.map((item) => this.notificationAssembler.toEntityFromResource(item));
  }

  async retryNotification(notificationId: string): Promise<TenantNotification> {
    const item = await sendRequest(
      this.http.patch<TenantNotificationResource>(
        `${notificationsUrl}/${encodeURIComponent(notificationId)}/retry`,
        null,
      ),
      failed,
    );
    return this.notificationAssembler.toEntityFromResource(item);
  }

  // ---------- Logs ----------
  async listLogs(): Promise<CommunicationLog[]> {
    const items = await sendRequest(this.http.get<CommunicationLogResource[]>(logsUrl), failed);
    return items.map((item) => this.logAssembler.toEntityFromResource(item));
  }

  // ---------- Assignments ----------
  async listAssignments(): Promise<TenantAssignment[]> {
    const items = await sendRequest(
      this.http.get<TenantAssignmentResource[]>(assignmentsUrl),
      failed,
    );
    return items.map((item) => this.assignmentAssembler.toEntityFromResource(item));
  }

  async listTenants(): Promise<Tenant[]> {
    const items = await sendRequest(
      this.http.get<TenantAssignmentResource[]>(assignmentsUrl),
      failed,
    );
    return this.tenantAssembler.toEntitiesFromResources(items);
  }

  async assignTenant(assignment: TenantAssignment): Promise<TenantAssignment> {
    const item = await sendRequest(
      this.http.post<TenantAssignmentResource>(
        assignmentsUrl,
        this.assignmentAssembler.toRequestFromEntity(assignment),
      ),
      failed,
    );
    return this.assignmentAssembler.toEntityFromResource(item);
  }

  async terminateAssignment(assignmentId: string): Promise<TenantAssignment> {
    const item = await sendRequest(
      this.http.patch<TenantAssignmentResource>(
        `${assignmentsUrl}/${encodeURIComponent(assignmentId)}/terminate`,
        null,
      ),
      failed,
    );
    return this.assignmentAssembler.toEntityFromResource(item);
  }
}
