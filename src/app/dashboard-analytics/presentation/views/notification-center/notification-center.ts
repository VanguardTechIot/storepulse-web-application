import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { PageState } from '../../../../shared/presentation/components/page-state/page-state';
import { TranslationService } from '../../../../shared/infrastructure/i18n/translation.service';
import { LocalizedDatePipe } from '../../../../shared/presentation/pipes/localized-date.pipe';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { AnalyticsStore } from '../../../application/analytics.store';
import { Notification } from '../../../domain/model/notification.entity';
import { NotificationType } from '../../../domain/enums/notification-type.enum';
import { NotificationItem } from '../../components/notification-item/notification-item';

type TypeFilter = NotificationType | 'ALL';

interface NotificationDay {
  key: string;
  date: Date;
  notifications: Notification[];
}

/** Notification history grouped by day and filtered by type. */
@Component({
  selector: 'app-notification-center',
  imports: [
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatIconModule,
    RouterLink,
    NotificationItem,
    PageState,
    TranslatePipe,
    LocalizedDatePipe,
  ],
  templateUrl: './notification-center.html',
  styleUrls: [
    '../../../../shared/presentation/styles/storepulse-theme.css',
    '../../../../shared/presentation/styles/page.css',
    '../analytics.css',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationCenter {
  protected readonly store = inject(AnalyticsStore);
  private readonly i18n = inject(TranslationService);

  protected readonly filters: TypeFilter[] = [
    'ALL',
    NotificationType.SafetyAlert,
    NotificationType.ConnectivityAlert,
    NotificationType.ConsumptionDeviation,
  ];
  protected readonly filter = signal<TypeFilter>('ALL');

  protected readonly days = computed<NotificationDay[]>(() => {
    const filter = this.filter();
    const days = new Map<string, NotificationDay>();
    for (const notification of this.store.notifications()) {
      if (filter !== 'ALL' && notification.type !== filter) continue;
      const date = notification.generatedAt;
      const key = [date.getFullYear(), date.getMonth() + 1, date.getDate()]
        .map((part) => String(part).padStart(2, '0'))
        .join('-');
      if (!days.has(key)) days.set(key, { key, date, notifications: [] });
      days.get(key)!.notifications.push(notification);
    }
    return [...days.values()];
  });

  constructor() {
    this.store.load().catch(() => undefined);
  }

  protected count(filter: TypeFilter): number {
    return this.store.countByType(filter === 'ALL' ? null : filter);
  }

  protected refresh(): void {
    this.store.load(true).catch(() => undefined);
  }

  protected markAllAsRead(): void {
    this.store.markAllAsRead().catch(() => undefined);
  }

  /** "Today" or "Yesterday"; `null` lets the template show the date. */
  protected dayLabel(date: Date): string | null {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (date.toDateString() === today.toDateString()) {
      return this.i18n.t('analytics.notifications.today');
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return this.i18n.t('analytics.notifications.yesterday');
    }
    return null;
  }
}
