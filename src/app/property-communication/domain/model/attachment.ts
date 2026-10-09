import { CommunicationError, CommunicationErrorCode } from './communication-error';

const allowedMimeTypes: readonly string[] = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
];

/**
 * Supporting document of a message, such as a bill, a receipt or a photo (Entity). It cannot
 * change once created.
 */
export class Attachment {
  static readonly maxSizeBytes = 2 * 1024 * 1024;
  static readonly allowedMimeTypes = allowedMimeTypes;

  readonly fileName: string;
  readonly url: string;
  readonly mimeType: string;
  readonly sizeBytes: number;

  constructor(attachment: { fileName: string; url: string; mimeType: string; sizeBytes: number }) {
    if (!attachment.fileName.trim() || !attachment.url.trim()) {
      throw new CommunicationError(CommunicationErrorCode.InvalidAttachment);
    }
    if (!Attachment.isAllowedType(attachment.mimeType)) {
      throw new CommunicationError(CommunicationErrorCode.InvalidAttachment);
    }
    if (attachment.sizeBytes > Attachment.maxSizeBytes) {
      throw new CommunicationError(CommunicationErrorCode.AttachmentTooLarge);
    }
    this.fileName = attachment.fileName.trim();
    this.url = attachment.url;
    this.mimeType = attachment.mimeType;
    this.sizeBytes = attachment.sizeBytes;
    Object.freeze(this);
  }

  get isImage(): boolean {
    return this.mimeType.startsWith('image/');
  }

  static isAllowedType(mimeType: string): boolean {
    return allowedMimeTypes.includes(mimeType);
  }
}
