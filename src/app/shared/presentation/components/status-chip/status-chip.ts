import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { Tone } from '../tone-icon/tone-icon';

/** Read-only Material chip tinted with a status color, optionally led by a status dot. */
@Component({
  selector: 'app-status-chip',
  imports: [MatChipsModule],
  templateUrl: './status-chip.html',
  styleUrl: './status-chip.css',
  host: {
    '[style.--tone]': "'var(--sp-' + tone() + ')'",
    '[style.--tone-soft]': "'var(--sp-' + tone() + '-soft)'",
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusChip {
  readonly tone = input<Tone>('neutral');
  readonly dot = input(false);
}
