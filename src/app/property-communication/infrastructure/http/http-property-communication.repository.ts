import { HttpClient, HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { inject } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { retryOnDroppedConnection } from '../../../shared/infrastructure/retry-on-dropped-connection';
import { environment } from '../../../../environments/environment';
import { CommunicationError, CommunicationErrorCode } from '../../domain/model/communication-error';
import { CommunicationLog } from '../../domain/model/communication-log.entity';
import { Conversation } from '../../domain/model/conversation.entity';
import { Message } from '../../domain/model/message.entity';
import { TenantAssignment } from '../../domain/model/tenant-assignment.entity';
import { TenantNotification } from '../../domain/model/tenant-notification.entity';
import { PropertyCommunicationRepository } from '../../domain/repository/property-communication.repository';
import {
  CommunicationLogAssembler,
  ConversationAssembler,
  MessageAssembler,
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

function conversationUrl(conversationId: string, path = ''): string {
  return `${conversationsUrl}/${encodeURIComponent(conversationId)}${path}`;
}

/** New resources are sent without id: the server assigns it. */
function withoutId<T extends { id: string }>(resource: T): Omit<T, 'id'> {
  const { id: _id, ...rest } = resource;
  return rest;
}

/**
 * HTTP implementation of the repository over the local data server (json-server).
 *
 * The REST API lists notifications and logs per tenant; the web application is the view of the
 * administrator, so here they are filtered by `galleryAdministratorId`. When the REST API exists,
 * only this class changes.
 */
export class HttpPropertyCommunicationRepository implements PropertyCommunicationRepository {
  private readonly http = inject(HttpClient);
  private readonly conversationAssembler = new ConversationAssembler();
  private readonly messageAssembler = new MessageAssembler();
  private readonly notificationAssembler = new TenantNotificationAssembler();
  private readonly logAssembler = new CommunicationLogAssembler();
  private readonly assignmentAssembler = new TenantAssignmentAssembler();

  // ---------- Conversations ----------
  async listConversations(administratorId: string): Promise<Conversation[]> {
    const url = `${conversationsUrl}/administrators/${encodeURIComponent(administratorId)}`;
    const items = await this.request(this.http.get<ConversationResource[]>(url));
    return items.map((item) => this.conversationAssembler.toEntityFromResource(item));
  }

  async getConversation(conversationId: string): Promise<Conversation> {
    const item = await this.request(
      this.http.get<ConversationResource>(conversationUrl(conversationId)),
      CommunicationErrorCode.ConversationNotFound,
    );
    return this.conversationAssembler.toEntityFromResource(item);
  }

  async startConversation(conversation: Conversation): Promise<Conversation> {
    const item = await this.request(
      this.http.post<ConversationResource>(
        conversationsUrl,
        withoutId(this.conversationAssembler.toResourceFromEntity(conversation)),
      ),
    );
    return this.conversationAssembler.toEntityFromResource(item);
  }

  async updateConversation(conversation: Conversation): Promise<Conversation> {
    const item = await this.request(
      this.http.patch<ConversationResource>(conversationUrl(conversation.id), {
        lastMessageAt: conversation.lastMessageAt.toISOString(),
      }),
      CommunicationErrorCode.ConversationNotFound,
    );
    return this.conversationAssembler.toEntityFromResource(item);
  }

  async resolveConversation(conversation: Conversation): Promise<Conversation> {
    const item = await this.request(
      this.http.patch<ConversationResource>(conversationUrl(conversation.id, '/resolve'), {
        status: conversation.status,
        resolvedAt: conversation.resolvedAt?.toISOString() ?? null,
      }),
      CommunicationErrorCode.ConversationNotFound,
    );
    return this.conversationAssembler.toEntityFromResource(item);
  }

  // ---------- Messages ----------
  async listMessages(conversationId: string): Promise<Message[]> {
    const items = await this.request(
      this.http.get<MessageResource[]>(conversationUrl(conversationId, '/messages')),
      CommunicationErrorCode.ConversationNotFound,
    );
    return items.map((item) => this.messageAssembler.toEntityFromResource(item));
  }

  async sendMessage(message: Message): Promise<Message> {
    const item = await this.request(
      this.http.post<MessageResource>(
        conversationUrl(message.conversationId, '/messages'),
        withoutId(this.messageAssembler.toResourceFromEntity(message)),
      ),
      CommunicationErrorCode.ConversationNotFound,
    );
    return this.messageAssembler.toEntityFromResource(item);
  }

  // ---------- Notifications ----------
  async listNotifications(administratorId: string): Promise<TenantNotification[]> {
    const items = await this.request(
      this.http.get<TenantNotificationResource[]>(notificationsUrl, {
        params: { galleryAdministratorId: administratorId },
      }),
    );
    return items.map((item) => this.notificationAssembler.toEntityFromResource(item));
  }

  async createNotification(notification: TenantNotification): Promise<TenantNotification> {
    const item = await this.request(
      this.http.post<TenantNotificationResource>(
        notificationsUrl,
        withoutId(this.notificationAssembler.toResourceFromEntity(notification)),
      ),
    );
    return this.notificationAssembler.toEntityFromResource(item);
  }

  async updateNotification(notification: TenantNotification): Promise<TenantNotification> {
    const item = await this.request(
      this.http.patch<TenantNotificationResource>(
        `${notificationsUrl}/${encodeURIComponent(notification.id)}`,
        { status: notification.status },
      ),
    );
    return this.notificationAssembler.toEntityFromResource(item);
  }

  // ---------- Logs ----------
  async listLogs(administratorId: string): Promise<CommunicationLog[]> {
    const items = await this.request(
      this.http.get<CommunicationLogResource[]>(logsUrl, {
        params: { galleryAdministratorId: administratorId },
      }),
    );
    return items.map((item) => this.logAssembler.toEntityFromResource(item));
  }

  async registerLog(log: CommunicationLog): Promise<CommunicationLog> {
    const item = await this.request(
      this.http.post<CommunicationLogResource>(
        logsUrl,
        withoutId(this.logAssembler.toResourceFromEntity(log)),
      ),
    );
    return this.logAssembler.toEntityFromResource(item);
  }

  // ---------- Assignments ----------
  async listAssignments(administratorId: string): Promise<TenantAssignment[]> {
    const items = await this.request(
      this.http.get<TenantAssignmentResource[]>(assignmentsUrl, {
        params: { galleryAdministratorId: administratorId },
      }),
    );
    return items.map((item) => this.assignmentAssembler.toEntityFromResource(item));
  }

  async assignTenant(assignment: TenantAssignment): Promise<TenantAssignment> {
    const item = await this.request(
      this.http.post<TenantAssignmentResource>(
        assignmentsUrl,
        withoutId(this.assignmentAssembler.toResourceFromEntity(assignment)),
      ),
      CommunicationErrorCode.UnitNotFound,
    );
    return this.assignmentAssembler.toEntityFromResource(item);
  }

  async terminateAssignment(assignment: TenantAssignment): Promise<TenantAssignment> {
    const item = await this.request(
      this.http.patch<TenantAssignmentResource>(
        `${assignmentsUrl}/${encodeURIComponent(assignment.id)}/terminate`,
        {
          status: assignment.status,
          terminatedAt: assignment.terminatedAt?.toISOString() ?? null,
        },
      ),
      CommunicationErrorCode.AssignmentNotActive,
    );
    return this.assignmentAssembler.toEntityFromResource(item);
  }

  /** Runs a request and maps 404 and 409 to business errors; anything else stays unexpected. */
  private async request<T>(
    call: Observable<T>,
    notFound: CommunicationErrorCode = CommunicationErrorCode.Unexpected,
  ): Promise<T> {
    try {
      return await firstValueFrom(call.pipe(retryOnDroppedConnection()));
    } catch (error) {
      if (!(error instanceof HttpErrorResponse)) throw error;
      if (
        error.status === HttpStatusCode.NotFound &&
        notFound !== CommunicationErrorCode.Unexpected
      ) {
        throw new CommunicationError(notFound);
      }
      if (error.status === HttpStatusCode.Conflict) {
        throw new CommunicationError(CommunicationErrorCode.UnitAlreadyAssigned);
      }
      throw error;
    }
  }
}
