import { computed, inject, Injectable, signal } from '@angular/core';
import { CommunicationAction } from '../domain/model/communication-action.enum';
import { CommunicationError, CommunicationErrorCode } from '../domain/model/communication-error';
import { Conversation } from '../domain/model/conversation.entity';
import { Message } from '../domain/model/message.entity';
import { NotificationChannel } from '../domain/model/notification-channel.enum';
import { NotificationType } from '../domain/model/notification-type.enum';
import { NotifyTenantCommand } from '../domain/model/notify-tenant.command';
import { AttachmentData, SendMessageCommand } from '../domain/model/send-message.command';
import { SenderRole } from '../domain/model/sender-role.enum';
import { StartConversationCommand } from '../domain/model/start-conversation.command';
import { TenantNotification } from '../domain/model/tenant-notification.entity';
import { PROPERTY_COMMUNICATION_REPOSITORY } from '../infrastructure/property-communication.token';
import { CommunicationDirectory } from './communication-directory';
import { runOperation } from './run-operation';
import { TenantNotifier } from './tenant-notifier';

/** What the administrator writes to open a conversation with a tenant. */
export interface NewConversation {
  tenantId: string;
  subject: string;
  content: string;
  attachments: AttachmentData[];
}

/** A notification body cannot be longer than this, so long messages are shortened. */
function preview(content: string): string {
  const max = TenantNotification.bodyMaxLength;
  return content.length > max ? `${content.slice(0, max - 1)}…` : content;
}

/**
 * Application service of the conversations between the administrator and the tenants: list,
 * detail, start, send messages and resolve.
 */
@Injectable({ providedIn: 'root' })
export class ConversationsStore {
  private readonly repository = inject(PROPERTY_COMMUNICATION_REPOSITORY);
  private readonly notifier = inject(TenantNotifier);
  readonly directory = inject(CommunicationDirectory);

  private readonly conversationsState = signal<Conversation[]>([]);
  private readonly currentState = signal<Conversation | null>(null);
  private readonly messagesState = signal<Message[]>([]);

  readonly current = this.currentState.asReadonly();
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<CommunicationErrorCode | null>(null);

  /** Most recent activity first (GetConversationsByAdministratorQuery). */
  readonly conversations = computed(() =>
    [...this.conversationsState()].sort(
      (a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime(),
    ),
  );
  readonly openCount = computed(() => this.conversationsState().filter((c) => c.isOpen).length);

  /** Messages of the open conversation, oldest first, as a chat reads. */
  readonly messages = computed(() =>
    [...this.messagesState()].sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime()),
  );

  load(): Promise<boolean> {
    return runOperation(this.loading, this.error, async () => {
      const administratorId = await this.directory.load();
      this.conversationsState.set(await this.repository.listConversations(administratorId));
    });
  }

  /** Detail of a conversation with its messages (GetConversationByIdQuery). */
  open(conversationId: string): Promise<boolean> {
    return runOperation(this.loading, this.error, async () => {
      if (this.currentState()?.id !== conversationId) {
        this.currentState.set(null);
        this.messagesState.set([]);
      }
      const [conversation, messages] = await Promise.all([
        this.repository.getConversation(conversationId),
        this.repository.listMessages(conversationId),
        this.directory.tenants().length === 0 ? this.directory.load() : Promise.resolve(''),
      ]);
      this.currentState.set(conversation);
      this.messagesState.set(messages);
    });
  }

  /**
   * StartConversationCommand followed by the first message. The tenant is notified and the
   * conversation is logged. On success `current` holds the new conversation.
   */
  start(input: NewConversation): Promise<boolean> {
    return runOperation(this.saving, this.error, async () => {
      const administratorId = this.directory.requireAdministrator();
      if (!this.directory.tenant(input.tenantId)) {
        throw new CommunicationError(CommunicationErrorCode.TenantNotFound);
      }
      const assignments = await this.repository.listAssignments(administratorId);
      const unitId =
        assignments.find((a) => a.isActive && a.tenantId === input.tenantId)?.commercialUnitId ??
        null;
      const draft = Conversation.start(
        new StartConversationCommand({
          tenantId: input.tenantId,
          commercialUnitId: unitId,
          galleryAdministratorId: administratorId,
          subject: input.subject,
        }),
      );
      // Validates the first message before anything is saved.
      draft.writeMessage(
        this.messageCommand('', administratorId, input.content, input.attachments),
      );

      const conversation = await this.repository.startConversation(draft);
      const { message } = conversation.writeMessage(
        this.messageCommand(conversation.id, administratorId, input.content, input.attachments),
      );
      const saved = await this.repository.sendMessage(message);
      await this.notifier.logConversation(conversation, CommunicationAction.ConversationStarted);
      await this.notifier.notify(
        new NotifyTenantCommand({
          tenantId: conversation.tenantId,
          commercialUnitId: conversation.commercialUnitId,
          galleryAdministratorId: administratorId,
          type: NotificationType.ConversationStarted,
          title: conversation.subject,
          body: preview(saved.content),
          channel: NotificationChannel.Push,
          referenceId: conversation.id,
        }),
      );
      this.conversationsState.update((items) => [conversation, ...items]);
      this.currentState.set(conversation);
      this.messagesState.set([saved]);
    });
  }

  /** SendMessageCommand on the open conversation; the tenant receives a push notification. */
  send(content: string, attachments: AttachmentData[]): Promise<boolean> {
    return runOperation(this.saving, this.error, async () => {
      const administratorId = this.directory.requireAdministrator();
      const current = this.requireCurrent();
      const { conversation, message } = current.writeMessage(
        this.messageCommand(current.id, administratorId, content, attachments),
      );
      const saved = await this.repository.sendMessage(message);
      const updated = await this.repository.updateConversation(conversation);
      this.replace(updated);
      this.messagesState.update((messages) => [...messages, saved]);
      await this.notifier.notify(
        new NotifyTenantCommand({
          tenantId: updated.tenantId,
          commercialUnitId: updated.commercialUnitId,
          galleryAdministratorId: administratorId,
          type: NotificationType.MessageReceived,
          title: updated.subject,
          body: preview(saved.content),
          channel: NotificationChannel.Push,
          referenceId: updated.id,
        }),
      );
    });
  }

  /** MarkConversationResolvedCommand on the open conversation. */
  resolve(): Promise<boolean> {
    return runOperation(this.saving, this.error, async () => {
      const resolved = await this.repository.resolveConversation(
        this.requireCurrent().markAsResolved(),
      );
      this.replace(resolved);
      await this.notifier.logConversation(resolved, CommunicationAction.ConversationResolved);
    });
  }

  clearError(): void {
    this.error.set(null);
  }

  private messageCommand(
    conversationId: string,
    administratorId: string,
    content: string,
    attachments: AttachmentData[],
  ): SendMessageCommand {
    return new SendMessageCommand({
      conversationId,
      senderId: administratorId,
      senderRole: SenderRole.GalleryAdministrator,
      content,
      attachments,
    });
  }

  private replace(conversation: Conversation): void {
    this.currentState.set(conversation);
    this.conversationsState.update((items) =>
      items.map((item) => (item.id === conversation.id ? conversation : item)),
    );
  }

  private requireCurrent(): Conversation {
    const conversation = this.currentState();
    if (!conversation) throw new CommunicationError(CommunicationErrorCode.ConversationNotFound);
    return conversation;
  }
}
