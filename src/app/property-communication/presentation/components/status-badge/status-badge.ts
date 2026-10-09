import { Component, computed, input } from '@angular/core';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';

const tones: Record<string, string> = {
  OPEN: 'badge--warning',
  RESOLVED: 'badge--success',
  PENDING: 'badge--neutral',
  SENT: 'badge--success',
  FAILED: 'badge--danger',
  ACTIVE: 'badge--success',
  TERMINATED: 'badge--neutral',
};

/** Status of a conversation, a notification or an assignment, translated as `communication.status.<value>`. */
@Component({
  selector: 'app-communication-status-badge',
  imports: [TranslatePipe],
  template: `<span [class]="'badge ' + tone()">{{
    'communication.status.' + status() | translate
  }}</span>`,
})
export class CommunicationStatusBadge {
  readonly status = input.required<string>();

  protected readonly tone = computed(() => tones[this.status()] ?? 'badge--neutral');
}
