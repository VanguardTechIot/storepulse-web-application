import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { TranslationService } from '../../../../shared/infrastructure/i18n/translation.service';
import { YearlyConsumptionSeries } from '../../../application/analytics.store';

const MONTH_KEYS = [
  'jan',
  'feb',
  'mar',
  'apr',
  'may',
  'jun',
  'jul',
  'aug',
  'sep',
  'oct',
  'nov',
  'dec',
];
/** Previous year in a muted tone, current year in the primary color of the theme. */
const COLORS = ['#cbd5e1', '#2563eb'];

/**
 * Monthly consumption of the gallery, current year against the previous one (mock-up 04).
 */
@Component({
  selector: 'app-consumption-chart',
  imports: [BaseChartDirective],
  providers: [provideCharts(withDefaultRegisterables())],
  template: `
    <div class="chart">
      <canvas
        baseChart
        type="bar"
        [data]="data()"
        [options]="options()"
        [attr.aria-label]="ariaLabel()"
        role="img"
      ></canvas>
    </div>
  `,
  styles: `
    .chart {
      position: relative;
      height: 280px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConsumptionChart {
  private readonly i18n = inject(TranslationService);

  readonly series = input.required<YearlyConsumptionSeries[]>();
  readonly ariaLabel = input('');

  protected readonly data = computed<ChartConfiguration<'bar'>['data']>(() => ({
    labels: MONTH_KEYS.map((key) => this.i18n.t('analytics.months.' + key)),
    datasets: this.series().map((serie, i) => ({
      label: String(serie.year),
      data: serie.values,
      backgroundColor: COLORS[i % COLORS.length],
      borderRadius: 4,
      maxBarThickness: 18,
    })),
  }));

  protected readonly options = computed<ChartConfiguration<'bar'>['options']>(() => {
    const unit = this.series().at(-1)?.unit ?? '';
    const locale = this.i18n.lang();
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top', align: 'end', labels: { boxWidth: 12, boxHeight: 12 } },
        tooltip: {
          callbacks: {
            label: (ctx) =>
              `${ctx.dataset.label}: ${Number(ctx.parsed.y).toLocaleString(locale)} ${unit}`,
          },
        },
      },
      scales: {
        x: { grid: { display: false } },
        y: {
          beginAtZero: true,
          title: { display: true, text: unit },
          ticks: { callback: (value) => Number(value).toLocaleString(locale) },
        },
      },
    };
  });
}
