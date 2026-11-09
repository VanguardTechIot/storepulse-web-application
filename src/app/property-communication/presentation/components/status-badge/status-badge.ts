import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { StatusChip } from '../../../../shared/presentation/components/status-chip/status-chip';
import { Tone } from '../../../../shared/presentation/components/tone-icon/tone-icon';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';

const tones: Record<string, Tone> = {
  OPEN: 'warning',
  RESOLVED: 'success',
  PENDING: 'neutral',
  SENT: 'success',
  FAILED: 'danger',
  ACTIVE: 'success',
  TERMINATED: 'neutral',
};

/** Status of a conversation, a notification or an assignment, translated as `communication.status.<value>`. */
@Component({
  selector: 'app-communication-status-badge',
  imports: [StatusChip, TranslatePipe],
  templateUrl: './status-badge.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommunicationStatusBadge {
  readonly status = input.required<string>();

  protected readonly tone = computed(() => tones[this.status()] ?? 'neutral');
}
