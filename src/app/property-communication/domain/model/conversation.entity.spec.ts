import { Attachment } from './attachment';
import { CommunicationError, CommunicationErrorCode } from './communication-error';
import { Conversation } from './conversation.entity';
import { ConversationStatus } from './conversation-status.enum';
import { MessageContent } from './message-content.value-object';
import { SendMessageCommand } from './send-message.command';
import { SenderRole } from './sender-role.enum';
import { StartConversationCommand } from './start-conversation.command';
import { Subject } from './subject.value-object';

describe('Conversation', () => {
  const now = new Date('2026-10-08T15:00:00Z');

  function start(subject = ' Corte de luz en el local A-03 '): Conversation {
    return Conversation.start(
      new StartConversationCommand({
        tenantId: 'usr-002',
        commercialUnitId: 'unit-a03',
        galleryAdministratorId: 'usr-001',
        subject,
      }),
      now,
    );
  }

  function message(content: string, attachments: SendMessageCommand['attachments'] = []) {
    return new SendMessageCommand({
      conversationId: 'cnv-001',
      senderId: 'usr-001',
      senderRole: SenderRole.GalleryAdministrator,
      content,
      attachments,
    });
  }

  function errorOf(change: () => unknown): CommunicationErrorCode | null {
    try {
      change();
      return null;
    } catch (error) {
      return error instanceof CommunicationError ? error.code : null;
    }
  }

  it('starts open with a trimmed subject of 1 to 200 characters', () => {
    const conversation = start();

    expect(conversation.status).toBe(ConversationStatus.Open);
    expect(conversation.subject).toBe('Corte de luz en el local A-03');
    expect(errorOf(() => start(' '))).toBe(CommunicationErrorCode.InvalidSubject);
    expect(errorOf(() => start('x'.repeat(Subject.maxLength + 1)))).toBe(
      CommunicationErrorCode.InvalidSubject,
    );
  });

  it('writes messages of up to 2000 characters and moves its last activity', () => {
    const later = new Date('2026-10-08T16:00:00Z');
    const { conversation, message: written } = start().writeMessage(
      message(' Ya va el electricista. '),
      later,
    );

    expect(written.content).toBe('Ya va el electricista.');
    expect(written.isFromAdministrator).toBe(true);
    expect(conversation.lastMessageAt).toEqual(later);
    expect(errorOf(() => start().writeMessage(message('')))).toBe(
      CommunicationErrorCode.InvalidMessageContent,
    );
    expect(
      errorOf(() => start().writeMessage(message('x'.repeat(MessageContent.maxLength + 1)))),
    ).toBe(CommunicationErrorCode.InvalidMessageContent);
  });

  it('accepts PDF and image attachments up to 2 MB', () => {
    const pdf = {
      fileName: 'recibo.pdf',
      url: 'data:application/pdf;base64,AA==',
      mimeType: 'application/pdf',
      sizeBytes: 1024,
    };

    expect(start().writeMessage(message('Adjunto el recibo', [pdf])).message.hasAttachments).toBe(
      true,
    );
    expect(
      errorOf(() =>
        start().writeMessage(message('Hola', [{ ...pdf, mimeType: 'application/zip' }])),
      ),
    ).toBe(CommunicationErrorCode.InvalidAttachment);
    expect(
      errorOf(() =>
        start().writeMessage(message('Hola', [{ ...pdf, sizeBytes: Attachment.maxSizeBytes + 1 }])),
      ),
    ).toBe(CommunicationErrorCode.AttachmentTooLarge);
  });

  it('records the resolution and refuses new messages afterwards', () => {
    const resolved = start().markAsResolved(now);

    expect(resolved.status).toBe(ConversationStatus.Resolved);
    expect(resolved.resolvedAt).toEqual(now);
    expect(errorOf(() => resolved.writeMessage(message('Hola')))).toBe(
      CommunicationErrorCode.ConversationResolved,
    );
    expect(errorOf(() => resolved.markAsResolved())).toBe(
      CommunicationErrorCode.ConversationResolved,
    );
  });
});
