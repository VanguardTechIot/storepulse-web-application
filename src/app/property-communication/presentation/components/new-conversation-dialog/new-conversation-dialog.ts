import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Callout } from '../../../../shared/presentation/components/callout/callout';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { ConversationsStore } from '../../../application/conversations.store';
import { CommunicationError } from '../../../domain/model/communication-error';
import { MessageContent } from '../../../domain/model/message-content.value-object';
import { AttachmentData } from '../../../domain/model/send-message.command';
import { Subject } from '../../../domain/model/subject.value-object';
import { acceptedAttachmentTypes, attachmentIcon, readAttachment } from '../../attachment-reader';
import { notBlankValidator } from '../../communication.validators';

/** Starts a conversation with a tenant with a subject and a first message. */
@Component({
  selector: 'app-new-conversation-dialog',
  imports: [
    Callout,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    TranslatePipe,
  ],
  templateUrl: './new-conversation-dialog.html',
  styles: `
    .form {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding-top: 4px;
    }
    app-callout {
      margin-bottom: 12px;
    }
    .attachments {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 6px;
    }
    .attachment {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 6px 4px 10px;
      border: 1px solid var(--sp-border);
      border-radius: 999px;
      font-size: 12px;
    }
    .attachment .mat-icon {
      width: 16px;
      height: 16px;
      font-size: 16px;
    }
    .attachment button {
      display: inline-grid;
      place-items: center;
      padding: 0;
      border: none;
      background: none;
      color: var(--sp-text-muted);
    }
  `,
})
export class NewConversationDialog {
  protected readonly store = inject(ConversationsStore);
  private readonly dialogRef = inject(MatDialogRef<NewConversationDialog, string>);

  protected readonly subjectMaxLength = Subject.maxLength;
  protected readonly contentMaxLength = MessageContent.maxLength;
  protected readonly accept = acceptedAttachmentTypes;
  protected readonly attachmentIcon = attachmentIcon;
  protected readonly attachments = signal<AttachmentData[]>([]);
  protected readonly attachmentError = signal<string | null>(null);

  protected readonly form = new FormGroup({
    tenantId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    subject: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, notBlankValidator, Validators.maxLength(Subject.maxLength)],
    }),
    content: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        notBlankValidator,
        Validators.maxLength(MessageContent.maxLength),
      ],
    }),
  });

  constructor() {
    this.store.clearError();
  }

  protected async addFiles(input: HTMLInputElement): Promise<void> {
    this.attachmentError.set(null);
    for (const file of Array.from(input.files ?? [])) {
      try {
        const attachment = await readAttachment(file);
        this.attachments.update((items) => [...items, attachment]);
      } catch (error) {
        this.attachmentError.set(
          error instanceof CommunicationError ? error.code : 'invalid_attachment',
        );
      }
    }
    input.value = '';
  }

  protected removeAttachment(index: number): void {
    this.attachments.update((items) => items.filter((_, i) => i !== index));
  }

  protected async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { tenantId, subject, content } = this.form.getRawValue();
    if (await this.store.start({ tenantId, subject, content, attachments: this.attachments() })) {
      this.dialogRef.close(this.store.current()?.id);
    }
  }
}
