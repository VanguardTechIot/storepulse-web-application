import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { Tone, ToneIcon } from '../../../../shared/presentation/components/tone-icon/tone-icon';

/** Key indicator card: label, value with unit and a projected hint. */
@Component({
  selector: 'app-kpi-card',
  imports: [MatCardModule, ToneIcon],
  templateUrl: './kpi-card.html',
  styleUrl: './kpi-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KpiCard {
  readonly icon = input.required<string>();
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly unit = input('');
  readonly tone = input<Tone>('primary');
}
