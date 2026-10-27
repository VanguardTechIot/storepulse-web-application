import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

export type Tone = 'primary' | 'info' | 'danger' | 'warning' | 'success' | 'violet' | 'neutral';

/** Material icon on a soft square tinted with a status color. */
@Component({
  selector: 'app-tone-icon',
  imports: [MatIconModule],
  templateUrl: './tone-icon.html',
  styleUrl: './tone-icon.css',
  host: {
    '[style.--tone]': "'var(--sp-' + tone() + ')'",
    '[style.--tone-soft]': "'var(--sp-' + tone() + '-soft)'",
    '[style.--size.px]': 'size()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToneIcon {
  readonly icon = input.required<string>();
  readonly tone = input<Tone>('primary');
  readonly size = input(36);
}
