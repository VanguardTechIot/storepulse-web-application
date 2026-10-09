import { BaseEntity } from '../../../shared/domain/model/base-entity';
import { Attachment } from './attachment';
import { CommunicationError, CommunicationErrorCode } from './communication-error';
import { ConversationStatus } from './conversation-status.enum';
import { Message } from './message.entity';
import { MessageContent } from './message-content.value-object';
import { SendMessageCommand } from './send-message.command';
import { StartConversationCommand } from './start-conversation.command';
import { Subject } from './subject.value-object';

interface ConversationProps {
  id: string;
  tenantId: string;
  /** Store of the tenant the conversation is about, when known. */
  commercialUnitId: string | null;
  galleryAdministratorId: string;
  subject: string;
  status: ConversationStatus;
  startedAt: Date;
  lastMessageAt: Date;
  resolvedAt: Date | null;
}

/**
 * Conversation between a tenant and the gallery administrator (Aggregate Root). It owns its
 * messages: nothing can be sent once it is resolved, and the resolution date is kept.
 */
export class Conversation implements BaseEntity {
  private readonly props: ConversationProps;

  constructor(conversation: ConversationProps) {
    this.props = { ...conversation };
  }

  /** Starts a conversation; it gets its id when the repository saves it. */
  static start(command: StartConversationCommand, now: Date = new Date()): Conversation {
    if (!Subject.isValid(command.subject)) {
      throw new CommunicationError(CommunicationErrorCode.InvalidSubject);
    }
    return new Conversation({
      id: '',
      tenantId: command.tenantId,
      commercialUnitId: command.commercialUnitId,
      galleryAdministratorId: command.galleryAdministratorId,
      subject: new Subject(command.subject).value,
      status: ConversationStatus.Open,
      startedAt: now,
      lastMessageAt: now,
      resolvedAt: null,
    });
  }

  get id(): string {
    return this.props.id;
  }

  get tenantId(): string {
    return this.props.tenantId;
  }

  get commercialUnitId(): string | null {
    return this.props.commercialUnitId;
  }

  get galleryAdministratorId(): string {
    return this.props.galleryAdministratorId;
  }

  get subject(): string {
    return this.props.subject;
  }

  get status(): ConversationStatus {
    return this.props.status;
  }

  get startedAt(): Date {
    return this.props.startedAt;
  }

  get lastMessageAt(): Date {
    return this.props.lastMessageAt;
  }

  get resolvedAt(): Date | null {
    return this.props.resolvedAt;
  }

  get isOpen(): boolean {
    return this.props.status === ConversationStatus.Open;
  }

  /**
   * Validates a new message and returns it with the conversation updated to its date. The message
   * gets its id when the repository saves it.
   */
  writeMessage(
    command: SendMessageCommand,
    now: Date = new Date(),
  ): { conversation: Conversation; message: Message } {
    if (!this.isOpen) throw new CommunicationError(CommunicationErrorCode.ConversationResolved);
    if (!MessageContent.isValid(command.content)) {
      throw new CommunicationError(CommunicationErrorCode.InvalidMessageContent);
    }
    const attachments = command.attachments.map((attachment) => new Attachment(attachment));
    const message = new Message(
      '',
      this.props.id,
      command.senderId,
      command.senderRole,
      new MessageContent(command.content).value,
      attachments,
      now,
    );
    return { conversation: new Conversation({ ...this.props, lastMessageAt: now }), message };
  }

  /** Closes the conversation (MarkConversationResolvedCommand). */
  markAsResolved(now: Date = new Date()): Conversation {
    if (!this.isOpen) throw new CommunicationError(CommunicationErrorCode.ConversationResolved);
    return new Conversation({
      ...this.props,
      status: ConversationStatus.Resolved,
      resolvedAt: now,
    });
  }
}
