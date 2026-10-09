import { Attachment } from '../domain/model/attachment';
import { CommunicationError, CommunicationErrorCode } from '../domain/model/communication-error';
import { AttachmentData } from '../domain/model/send-message.command';

/**
 * Turns a file chosen by the administrator into the data of an attachment. There is no file
 * storage in local development, so the file travels inside the message as a data URL; with the
 * REST API it would be uploaded and referenced by its URL.
 */
export function readAttachment(file: File): Promise<AttachmentData> {
  if (!Attachment.isAllowedType(file.type)) {
    return Promise.reject(new CommunicationError(CommunicationErrorCode.InvalidAttachment));
  }
  if (file.size > Attachment.maxSizeBytes) {
    return Promise.reject(new CommunicationError(CommunicationErrorCode.AttachmentTooLarge));
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolve({
        fileName: file.name,
        url: String(reader.result),
        mimeType: file.type,
        sizeBytes: file.size,
      });
    reader.onerror = () => reject(new CommunicationError(CommunicationErrorCode.InvalidAttachment));
    reader.readAsDataURL(file);
  });
}

/** Material icon for an attachment type. */
export function attachmentIcon(mimeType: string): string {
  return mimeType.startsWith('image/') ? 'image' : 'picture_as_pdf';
}

/** Attachment types accepted by the file picker. */
export const acceptedAttachmentTypes = Attachment.allowedMimeTypes.join(',');
