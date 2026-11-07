import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { TranslationService } from '../../../../shared/infrastructure/i18n/translation.service';
import { PageState } from '../../../../shared/presentation/components/page-state/page-state';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { appNav } from '../../../../shared/routing/app-nav';
import { AnalyticsStore } from '../../../application/analytics.store';
import { AlertItem } from '../../components/alert-item/alert-item';
import { KpiCard } from '../../components/kpi-card/kpi-card';
import { SensorAlertsChart } from '../../components/sensor-alerts-chart/sensor-alerts-chart';

const RECENT_ALERTS = 5;

/** Consolidated dashboard: key indicators of the month, open alerts by sensor and latest ones. */
@Component({
  selector: 'app-consolidated-dashboard',
  imports: [
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    RouterLink,
    AlertItem,
    KpiCard,
    PageState,
    SensorAlertsChart,
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

  protected readonly alertsRoute = appNav.alerts;
  protected readonly summary = this.store.summary;
  protected readonly recent = computed(() => this.store.openAlerts().slice(0, RECENT_ALERTS));

  constructor() {
    this.store.load().catch(() => undefined);
  }

  protected refresh(): void {
    this.store.load(true).catch(() => undefined);
  }

  protected formatValue(value: number | null | undefined): string {
    return value === null || value === undefined
      ? '—'
      : value.toLocaleString(this.i18n.lang(), { maximumFractionDigits: 1 });
  }
}
