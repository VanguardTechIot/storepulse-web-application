import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { TranslationService } from '../../../../shared/infrastructure/i18n/translation.service';
import { YearlyConsumptionSeries } from '../../../domain/model/yearly-consumption-series';

// Chart.js paints on a canvas and cannot read CSS variables: previous year muted, current year cyan.
const COLORS = ['#5b6b82', '#0ea5e9'];
const FONT = { family: "'Inter', sans-serif", size: 12 };

/** Monthly line chart that compares the current year with the previous one. */
@Component({
  selector: 'app-consumption-chart',
  imports: [BaseChartDirective],
  providers: [provideCharts(withDefaultRegisterables())],
  templateUrl: './consumption-chart.html',
  styleUrl: './consumption-chart.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConsumptionChart {
  private readonly i18n = inject(TranslationService);

  readonly series = input.required<YearlyConsumptionSeries[]>();
  readonly ariaLabel = input('');

  protected readonly data = computed<ChartConfiguration<'line'>['data']>(() => ({
    labels: Array.from({ length: 12 }, (_, month) =>
      new Date(2000, month, 1).toLocaleString(this.i18n.lang(), { month: 'short' }),
    ),
    datasets: this.series().map((serie, i) => ({
      label: String(serie.year),
      data: serie.values,
      borderColor: COLORS[i % COLORS.length],
      backgroundColor: COLORS[i % COLORS.length],
      borderWidth: 2,
      pointRadius: 3,
      tension: 0.3,
      spanGaps: true,
    })),
  }));

  protected readonly options = computed<ChartConfiguration<'line'>['options']>(() => {
    const unit = this.series().at(-1)?.unit ?? '';
    const locale = this.i18n.lang();
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          align: 'end',
          labels: { boxWidth: 10, boxHeight: 10, color: '#5b6b82', font: FONT },
        },
        tooltip: {
          backgroundColor: '#0f172a',
          titleFont: FONT,
          bodyFont: FONT,
          callbacks: {
            label: (ctx) =>
              `${ctx.dataset.label}: ${Number(ctx.parsed.y).toLocaleString(locale)} ${unit}`,
          },
        },
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#5b6b82', font: FONT } },
        y: {
          beginAtZero: false,
          grid: { color: '#e2e8f0' },
          border: { dash: [4, 4] },
          title: { display: true, text: unit, color: '#5b6b82', font: FONT },
          ticks: {
            color: '#5b6b82',
            font: FONT,
            callback: (value) => Number(value).toLocaleString(locale),
          },
        },
      },
    };
  });
}
