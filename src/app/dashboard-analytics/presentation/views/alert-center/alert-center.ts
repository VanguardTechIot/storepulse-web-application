import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { TranslationService } from '../../../../shared/infrastructure/i18n/translation.service';
import { PageState } from '../../../../shared/presentation/components/page-state/page-state';
import { ToastService } from '../../../../shared/presentation/components/toast-host/toast.service';
import { LocalizedDatePipe } from '../../../../shared/presentation/pipes/localized-date.pipe';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { AnalyticsStore } from '../../../application/analytics.store';
import { AlertStatus } from '../../../domain/enums/alert-status.enum';
import { Alert } from '../../../domain/model/alert.entity';
import { AlertItem } from '../../components/alert-item/alert-item';
import { askResolutionNote } from '../../components/resolve-alert-dialog/resolve-alert-dialog';

type StatusFilter = AlertStatus | 'ALL';

interface AlertDay {
  key: string;
  date: Date;
  alerts: Alert[];
}

/** Alert history grouped by day and filtered by state, where the administrator attends them. */
@Component({
  selector: 'app-alert-center',
  imports: [
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatIconModule,
    RouterLink,
    AlertItem,
    PageState,
    TranslatePipe,
    LocalizedDatePipe,
  ],
  templateUrl: './alert-center.html',
  styleUrls: [
    '../../../../shared/presentation/styles/storepulse-theme.css',
    '../../../../shared/presentation/styles/page.css',
    '../analytics.css',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertCenter {
  protected readonly store = inject(AnalyticsStore);
  private readonly i18n = inject(TranslationService);
  private readonly dialog = inject(MatDialog);
  private readonly toast = inject(ToastService);

  protected readonly filters: StatusFilter[] = [
    'ALL',
    AlertStatus.Active,
    AlertStatus.Acknowledged,
    AlertStatus.Resolved,
  ];
  protected readonly filter = signal<StatusFilter>('ALL');

  protected readonly days = computed<AlertDay[]>(() => {
    const filter = this.filter();
    const days = new Map<string, AlertDay>();
    for (const alert of this.store.alerts()) {
      if (filter !== 'ALL' && alert.status !== filter) continue;
      const date = alert.detectedAt;
      const key = [date.getFullYear(), date.getMonth() + 1, date.getDate()]
        .map((part) => String(part).padStart(2, '0'))
        .join('-');
      if (!days.has(key)) days.set(key, { key, date, alerts: [] });
      days.get(key)!.alerts.push(alert);
    }
    return [...days.values()];
  });

  constructor() {
    this.store.load().catch(() => undefined);
  }

  protected count(filter: StatusFilter): number {
    return this.store.countByStatus(filter === 'ALL' ? null : filter);
  }

  protected refresh(): void {
    this.store.load(true).catch(() => undefined);
  }

  protected async acknowledge(alert: Alert): Promise<void> {
    this.notify(await this.store.acknowledge(alert), 'analytics.alerts.acknowledged');
  }

  protected async resolve(alert: Alert): Promise<void> {
    const note = await askResolutionNote(this.dialog, 'resolve-dialog');
    if (note === null) return;
    this.notify(await this.store.resolve(alert, note), 'analytics.alerts.resolved');
  }

  /** "Today" or "Yesterday"; `null` lets the template show the date. */
  protected dayLabel(date: Date): string | null {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return this.i18n.t('analytics.alerts.today');
    if (date.toDateString() === yesterday.toDateString()) {
      return this.i18n.t('analytics.alerts.yesterday');
    }
    return null;
  }

  private notify(done: boolean, successKey: string): void {
    const error = this.store.error();
    if (done) this.toast.show('success', this.i18n.t(successKey));
    else if (error) this.toast.show('error', this.i18n.t('analytics.errors.' + error));
  }
}
