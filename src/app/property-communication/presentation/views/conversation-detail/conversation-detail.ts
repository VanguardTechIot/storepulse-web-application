import { Component, effect, ElementRef, inject, signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { TranslationService } from '../../../../shared/infrastructure/i18n/translation.service';
import { Callout } from '../../../../shared/presentation/components/callout/callout';
import { confirmAction } from '../../../../shared/presentation/components/confirmation-dialog/confirmation-dialog';
import { ToastService } from '../../../../shared/presentation/components/toast-host/toast.service';
import { LocalizedDatePipe } from '../../../../shared/presentation/pipes/localized-date.pipe';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { ConversationsStore } from '../../../application/conversations.store';
import { CommunicationError } from '../../../domain/model/communication-error';
import { MessageContent } from '../../../domain/model/message-content.value-object';
import { AttachmentData } from '../../../domain/model/send-message.command';
import { acceptedAttachmentTypes, attachmentIcon, readAttachment } from '../../attachment-reader';
import { notBlankValidator } from '../../communication.validators';
import { CommunicationStatusBadge } from '../../components/status-badge/status-badge';

/**
 * A conversation with a tenant: its messages and attachments, the reply box and its resolution.
 * Once resolved, no more messages can be sent.
 */
@Component({
  selector: 'app-conversation-detail',
  imports: [
    Callout,
    CommunicationStatusBadge,
    LocalizedDatePipe,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    RouterLink,
    TranslatePipe,
  ],
  templateUrl: './conversation-detail.html',
  styleUrl: '../../styles/communication.css',
})
export class ConversationDetail {
  protected readonly store = inject(ConversationsStore);
  private readonly dialog = inject(MatDialog);
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(TranslationService);

  private readonly conversationId = toSignal(
    inject(ActivatedRoute).paramMap.pipe(map((params) => params.get('conversationId') ?? '')),
    { initialValue: '' },
  );
  private readonly thread = viewChild<ElementRef<HTMLElement>>('thread');

  protected readonly contentMaxLength = MessageContent.maxLength;
  protected readonly accept = acceptedAttachmentTypes;
  protected readonly attachmentIcon = attachmentIcon;
  protected readonly attachments = signal<AttachmentData[]>([]);
  protected readonly attachmentError = signal<string | null>(null);
  protected readonly composer = new FormGroup({
    content: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        notBlankValidator,
        Validators.maxLength(MessageContent.maxLength),
      ],
    }),
  });
  protected readonly content = this.composer.controls.content;

  constructor() {
    effect(() => {
      const id = this.conversationId();
      if (id) void this.store.open(id);
    });
    // Keeps the newest message in view.
    effect(() => {
      this.store.messages();
      const thread = this.thread()?.nativeElement;
      if (thread) queueMicrotask(() => (thread.scrollTop = thread.scrollHeight));
    });
  }

  protected authorName(senderId: string, fromAdministrator: boolean): string {
    return fromAdministrator
      ? this.i18n.t('communication.conversation.you')
      : this.store.directory.tenantName(senderId);
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

  protected async send(): Promise<void> {
    if (this.content.invalid) {
      this.content.markAsTouched();
      return;
    }
    if (await this.store.send(this.content.value, this.attachments())) {
      this.content.reset('');
      this.attachments.set([]);
    }
  }

  /** Ctrl/Cmd + Enter sends the message. */
  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      void this.send();
    }
  }

  protected async resolve(): Promise<void> {
    const confirmed = await confirmAction(this.dialog, {
      title: this.i18n.t('communication.conversation.resolve_title'),
      message: this.i18n.t('communication.conversation.resolve_message'),
      confirmLabel: this.i18n.t('communication.conversation.resolve'),
      icon: 'task_alt',
    });
    if (confirmed && (await this.store.resolve())) {
      this.toast.show('success', this.i18n.t('communication.conversation.resolved'));
    }
  }
}
