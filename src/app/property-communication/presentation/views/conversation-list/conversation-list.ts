import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { LocalizedDatePipe } from '../../../../shared/presentation/pipes/localized-date.pipe';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { ConversationsStore } from '../../../application/conversations.store';
import { ConversationStatus } from '../../../domain/model/conversation-status.enum';
import { CommunicationTabs } from '../../components/communication-tabs/communication-tabs';
import { NewConversationDialog } from '../../components/new-conversation-dialog/new-conversation-dialog';
import { CommunicationStatusBadge } from '../../components/status-badge/status-badge';

type ConversationFilter = 'ALL' | ConversationStatus;

/** Chat with tenants: conversations of the administrator, most recent activity first. */
@Component({
  selector: 'app-conversation-list',
  imports: [
    CommunicationStatusBadge,
    CommunicationTabs,
    FormsModule,
    LocalizedDatePipe,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    RouterLink,
    TranslatePipe,
  ],
  templateUrl: './conversation-list.html',
  styleUrl: '../../styles/communication.css',
})
export class ConversationList {
  protected readonly store = inject(ConversationsStore);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);

  protected readonly filters: ConversationFilter[] = [
    'ALL',
    ConversationStatus.Open,
    ConversationStatus.Resolved,
  ];
  protected readonly filter = signal<ConversationFilter>(ConversationStatus.Open);
  protected readonly search = signal('');

  protected readonly visible = computed(() => {
    const filter = this.filter();
    const term = this.search().trim().toLocaleLowerCase();
    return this.store.conversations().filter((conversation) => {
      if (filter !== 'ALL' && conversation.status !== filter) return false;
      if (!term) return true;
      return [
        conversation.subject,
        this.store.directory.tenantName(conversation.tenantId),
        this.store.directory.unitLabel(conversation.commercialUnitId),
      ].some((text) => text.toLocaleLowerCase().includes(term));
    });
  });

  constructor() {
    void this.store.load();
  }

  protected initials(tenantId: string): string {
    return this.store.directory
      .tenantName(tenantId)
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase();
  }

  protected async startConversation(): Promise<void> {
    const ref = this.dialog.open<NewConversationDialog, void, string>(NewConversationDialog, {
      width: '600px',
    });
    const conversationId = await firstValueFrom(ref.afterClosed());
    if (conversationId)
      await this.router.navigate(['/communication/conversations', conversationId]);
  }
}
