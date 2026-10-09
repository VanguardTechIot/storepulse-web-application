import { SenderRole } from './sender-role.enum';

export interface AttachmentData {
  fileName: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
}

/** Sends a message, with optional supporting documents, inside a conversation. */
export class SendMessageCommand {
  readonly conversationId: string;
  readonly senderId: string;
  readonly senderRole: SenderRole;
  readonly content: string;
  readonly attachments: readonly AttachmentData[];

  constructor(command: {
    conversationId: string;
    senderId: string;
    senderRole: SenderRole;
    content: string;
    attachments?: readonly AttachmentData[];
  }) {
    this.conversationId = command.conversationId;
    this.senderId = command.senderId;
    this.senderRole = command.senderRole;
    this.content = command.content;
    this.attachments = command.attachments ?? [];
  }
}
