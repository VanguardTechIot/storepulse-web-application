import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { PageState } from '../../../../shared/presentation/components/page-state/page-state';
import { TranslationService } from '../../../../shared/infrastructure/i18n/translation.service';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { AnalyticsStore } from '../../../application/analytics.store';
import { PeriodConsumption } from '../../../domain/model/dashboard-summary';
import { UtilityType } from '../../../domain/enums/utility-type.enum';
import { ConsumptionChart } from '../../components/consumption-chart/consumption-chart';
import { KpiCard } from '../../components/kpi-card/kpi-card';
import { NotificationItem } from '../../components/notification-item/notification-item';

const RECENT_NOTIFICATIONS = 5;

/** Consolidated dashboard: key indicators, consumption trend and latest notifications. */
@Component({
  selector: 'app-consolidated-dashboard',
  imports: [
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatIconModule,
    RouterLink,
    ConsumptionChart,
    KpiCard,
    NotificationItem,
    PageState,
    TranslatePipe,
  ],
  templateUrl: './consolidated-dashboard.html',
  styleUrls: [
    '../../../../shared/presentation/styles/storepulse-theme.css',
    '../../../../shared/presentation/styles/page.css',
    '../analytics.css',
  ],
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

  /** Higher consumption is a deviation (amber); lower consumption is good news (green). */
  protected variationTone(consumption: PeriodConsumption | null): string {
    const variation = consumption?.variationPercent ?? 0;
    return variation > 0 ? 'delta warn' : variation < 0 ? 'delta up' : 'delta';
  }

  /** Builds `+3.4 % vs. September`, or a hint when there is nothing to compare. */
  protected variationText(consumption: PeriodConsumption | null): string {
    if (!consumption) return this.i18n.t('analytics.dashboard.kpis.no_measurements');
    const variation = consumption.variationPercent;
    if (variation === null) return this.i18n.t('analytics.dashboard.kpis.no_previous');
    const sign = variation > 0 ? '+' : variation < 0 ? '−' : '';
    // period is `YYYY-MM`: month index 0 to 11 of the month before it.
    const previousMonth = (Number(consumption.period.slice(5, 7)) + 10) % 12;
    return this.i18n.t('analytics.dashboard.kpis.vs_previous', {
      variation: `${sign}${Math.abs(variation).toLocaleString(this.i18n.lang(), { maximumFractionDigits: 1 })} %`,
      month: new Date(2000, previousMonth, 1).toLocaleString(this.i18n.lang(), { month: 'long' }),
    });
  }
}
