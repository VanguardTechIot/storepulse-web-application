import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { StatusChip } from '../../../../shared/presentation/components/status-chip/status-chip';
import { Tone, ToneIcon } from '../../../../shared/presentation/components/tone-icon/tone-icon';
import { LocalizedDatePipe } from '../../../../shared/presentation/pipes/localized-date.pipe';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { NotificationType } from '../../../domain/enums/notification-type.enum';
import { Notification } from '../../../domain/model/notification.entity';

// Same colors as the device LED: red for security events, amber for offline devices and deviations.
const STYLES: Record<NotificationType, { icon: string; tone: Tone }> = {
  [NotificationType.SafetyAlert]: { icon: 'shield', tone: 'danger' },
  [NotificationType.ConnectivityAlert]: { icon: 'wifi_off', tone: 'warning' },
  [NotificationType.ConsumptionDeviation]: { icon: 'bolt', tone: 'warning' },
};

/** One notification row: type, location, time, grouped events and unread mark. */
@Component({
  selector: 'app-notification-item',
  imports: [StatusChip, ToneIcon, TranslatePipe, LocalizedDatePipe],
  templateUrl: './notification-item.html',
  styleUrl: './notification-item.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationItem {
  readonly notification = input.required<Notification>();
  protected readonly style = computed(() => STYLES[this.notification().type]);
}
