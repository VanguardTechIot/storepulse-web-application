import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { TranslationService } from '../../../../shared/infrastructure/i18n/translation.service';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { AnalyticsStore } from '../../../application/analytics.store';
import { PeriodConsumption } from '../../../domain/model/dashboard-summary';
import { UtilityType } from '../../../domain/model/utility-type.enum';
import { ConsumptionChart } from '../../components/consumption-chart/consumption-chart';
import { KpiCard } from '../../components/kpi-card/kpi-card';
import { NotificationItem } from '../../components/notification-item/notification-item';

const RECENT_NOTIFICATIONS = 5;

/**
 * Consolidated Dashboard of the gallery administrator: active incidents, consumption of the period,
 * disconnected devices, consumption trend and latest notifications (US-50, TS-31, mock-ups 04/04d).
 */
@Component({
  selector: 'app-consolidated-dashboard',
  imports: [
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    MatProgressSpinnerModule,
    RouterLink,
    ConsumptionChart,
    KpiCard,
    NotificationItem,
    TranslatePipe,
  ],
  templateUrl: './consolidated-dashboard.html',
  styleUrl: '../../styles/analytics.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConsolidatedDashboard {
  protected readonly store = inject(AnalyticsStore);
  private readonly i18n = inject(TranslationService);

  protected readonly utilities = [UtilityType.Electricity, UtilityType.Water];
  protected readonly utility = signal<UtilityType>(UtilityType.Electricity);

  protected readonly summary = this.store.summary;
  protected readonly series = computed(() => this.store.yearlySeries(this.utility()));
  protected readonly recent = computed(() =>
    this.store.notifications().slice(0, RECENT_NOTIFICATIONS),
  );

  constructor() {
    this.store.load().catch(() => undefined);
  }

  protected refresh(): void {
    this.store.load(true).catch(() => undefined);
  }

  protected formatValue(value: number | null | undefined): string {
    return value === null || value === undefined
      ? '—'
      : value.toLocaleString(this.i18n.lang(), { maximumFractionDigits: 0 });
  }

  /** `+3.4 % vs. September` or the "no measurements" hint (TS-31, scenario 2). */
  protected variationText(consumption: PeriodConsumption | null): string {
    if (!consumption) return this.i18n.t('analytics.dashboard.kpis.no_measurements');
    const variation = consumption.variationPercent;
    if (variation === null) return this.i18n.t('analytics.dashboard.kpis.no_previous');
    const sign = variation > 0 ? '+' : variation < 0 ? '−' : '';
    const previousMonth = Number(consumption.period.slice(5, 7)) - 1 || 12;
    const months = [
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
    return this.i18n.t('analytics.dashboard.kpis.vs_previous', {
      variation: `${sign}${Math.abs(variation).toLocaleString(this.i18n.lang(), { maximumFractionDigits: 1 })} %`,
      month: this.i18n.t('analytics.months_long.' + months[previousMonth - 1]),
    });
  }
}
