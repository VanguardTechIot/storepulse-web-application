import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { TranslationService } from '../../../../shared/infrastructure/i18n/translation.service';
import { SensorType } from '../../../domain/enums/sensor-type.enum';

// Chart.js paints on a canvas and cannot read CSS variables: the danger red of the theme.
const COLOR = '#dc2626';
const MUTED = '#5b6b82';
const FONT = { family: "'Inter', sans-serif", size: 12 };

/** Horizontal bars with the open alerts of each sensor type, every type shown even at zero. */
@Component({
  selector: 'app-sensor-alerts-chart',
  imports: [BaseChartDirective],
  providers: [provideCharts(withDefaultRegisterables())],
  templateUrl: './sensor-alerts-chart.html',
  styleUrl: './sensor-alerts-chart.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SensorAlertsChart {
  private readonly i18n = inject(TranslationService);

  readonly counts = input.required<Partial<Record<SensorType, number>>>();
  readonly ariaLabel = input('');

  private readonly types = Object.values(SensorType);

  protected readonly data = computed<ChartConfiguration<'bar'>['data']>(() => ({
    labels: this.types.map((type) => this.i18n.t('analytics.sensor_types.' + type)),
    datasets: [
      {
        data: this.types.map((type) => this.counts()[type] ?? 0),
        backgroundColor: COLOR,
        borderRadius: 4,
        maxBarThickness: 22,
      },
    ],
  }));

  protected readonly options = computed<ChartConfiguration<'bar'>['options']>(() => ({
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: '#0f172a', titleFont: FONT, bodyFont: FONT },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: { color: '#e2e8f0' },
        border: { dash: [4, 4] },
        ticks: { color: MUTED, font: FONT, precision: 0 },
      },
      y: { grid: { display: false }, ticks: { color: MUTED, font: FONT } },
    },
  }));
}
