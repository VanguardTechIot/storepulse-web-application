import { BaseEntity } from '../../../shared/domain/model/base-entity';
import { Attachment } from './attachment';
import { SenderRole } from './sender-role.enum';

/**
 * Message of a conversation (Entity), written by the tenant or by the gallery administrator.
 * Created through `Conversation.writeMessage`, which validates it.
 */
export class Message implements BaseEntity {
  constructor(
    readonly id: string,
    readonly conversationId: string,
    readonly senderId: string,
    readonly senderRole: SenderRole,
    readonly content: string,
    readonly attachments: readonly Attachment[],
    readonly sentAt: Date,
  ) {}

  get isFromAdministrator(): boolean {
    return this.senderRole === SenderRole.GalleryAdministrator;
  }

  get hasAttachments(): boolean {
    return this.attachments.length > 0;
  }
}
