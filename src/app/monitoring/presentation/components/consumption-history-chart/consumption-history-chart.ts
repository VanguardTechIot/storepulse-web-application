import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { LocalizedDatePipe } from '../../../../shared/presentation/pipes/localized-date.pipe';
import { LocalizedNumberPipe } from '../../../../shared/presentation/pipes/localized-number.pipe';
import { Consumption } from '../../../domain/model/consumption.entity';

const WIDTH = 640;
const HEIGHT = 240;
const PAD = { left: 52, right: 12, top: 14, bottom: 30 };

/**
 * Bar chart of consumption per period with the historical average as a dashed guide line.
 */
@Component({
  selector: 'app-consumption-history-chart',
  imports: [LocalizedDatePipe, LocalizedNumberPipe],
  templateUrl: './consumption-history-chart.html',
  styleUrl: './consumption-history-chart.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConsumptionHistoryChart {
  readonly history = input.required<readonly Consumption[]>();
  readonly selectedPeriod = input.required<string>();
  readonly average = input<number | null>(null);
  readonly unit = input('');
  readonly label = input('');

  protected readonly width = WIDTH;
  protected readonly height = HEIGHT;
  protected readonly pad = PAD;

  private readonly max = computed(() => {
    const values = [...this.history().map((c) => c.totalValue), this.average() ?? 0];
    const raw = Math.max(...values, 1) * 1.1;
    const step = Math.pow(10, Math.floor(Math.log10(raw / 4)));
    const nice = [1, 1.5, 2, 2.5, 4, 5, 7.5, 10].map((m) => m * step).find((s) => s * 4 >= raw) ?? raw / 4;
    return nice * 4;
  });

  private readonly innerWidth = WIDTH - PAD.left - PAD.right;
  private readonly innerHeight = HEIGHT - PAD.top - PAD.bottom;

  protected readonly gridLines = computed(() =>
    [0, 1, 2, 3, 4].map((i) => ({
      y: PAD.top + this.innerHeight - (this.innerHeight * i) / 4,
      value: (this.max() * i) / 4,
    })),
  );

  protected readonly bars = computed(() => {
    const items = this.history();
    const slot = this.innerWidth / Math.max(items.length, 1);
    const barWidth = Math.min(36, slot * 0.6);
    return items.map((consumption, i) => {
      const barHeight = (this.innerHeight * consumption.totalValue) / this.max();
      const x = PAD.left + slot * i + (slot - barWidth) / 2;
      return {
        consumption,
        x,
        y: PAD.top + this.innerHeight - barHeight,
        width: barWidth,
        height: barHeight,
        labelX: x + barWidth / 2,
        selected: consumption.periodKey === this.selectedPeriod(),
      };
    });
  });

  protected readonly averageY = computed(() => {
    const average = this.average();
    return average === null ? null : PAD.top + this.innerHeight - (this.innerHeight * average) / this.max();
  });
}
