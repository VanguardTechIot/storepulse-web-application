import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { LocalizedDatePipe } from '../../../../shared/presentation/pipes/localized-date.pipe';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { NotificationType } from '../../../domain/model/notification-type.enum';
import { Notification } from '../../../domain/model/notification.entity';

const ICONS: Record<NotificationType, { icon: string; tone: string }> = {
  [NotificationType.SafetyAlert]: { icon: 'shield', tone: 'danger' },
  [NotificationType.ConnectivityAlert]: { icon: 'wifi_off', tone: 'violet' },
  [NotificationType.ConsumptionDeviation]: { icon: 'bolt', tone: 'warning' },
};

/**
 * One row of the Notification Center: type, unit, time and how many events it groups (US-49).
 */
@Component({
  selector: 'app-notification-item',
  imports: [MatIconModule, TranslatePipe, LocalizedDatePipe],
  template: `
    <span class="ico" [class]="style().tone"
      ><mat-icon aria-hidden="true">{{ style().icon }}</mat-icon></span
    >
    <div class="body">
      <b>
        {{ notification().message }}
        @if (notification().isGrouped) {
          <span class="badge badge--neutral">{{
            'analytics.notifications.grouped' | translate: { count: notification().occurrences }
          }}</span>
        }
      </b>
      <span class="sub"
        >{{ 'analytics.notification_types.' + notification().type | translate }} ·
        {{ notification().location }}</span
      >
    </div>
    <time [attr.datetime]="notification().generatedAt.toISOString()">{{
      notification().generatedAt | localizedDate: 'time'
    }}</time>
    @if (!notification().read) {
      <span class="dot" [attr.aria-label]="'analytics.notifications.unread' | translate"></span>
    }
  `,
  styles: `
    :host {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 0;
      border-bottom: 1px solid var(--sp-border);
    }
    :host(:last-child) {
      border-bottom: 0;
    }
    .ico {
      display: grid;
      place-items: center;
      flex: 0 0 36px;
      height: 36px;
      border-radius: 8px;
    }
    .ico mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }
    .danger {
      background: var(--sp-danger-soft);
      color: var(--sp-danger);
    }
    .violet {
      background: var(--sp-violet-soft);
      color: var(--sp-violet);
    }
    .warning {
      background: var(--sp-warning-soft);
      color: var(--sp-warning);
    }
    .body {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .body b {
      font-weight: 600;
      display: flex;
      gap: 8px;
      align-items: center;
      flex-wrap: wrap;
    }
    .sub {
      font-size: 13px;
      color: var(--sp-text-muted);
    }
    time {
      font-size: 13px;
      color: var(--sp-text-muted);
      white-space: nowrap;
    }
    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--sp-primary);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationItem {
  readonly notification = input.required<Notification>();
  protected readonly style = computed(() => ICONS[this.notification().type]);
}
