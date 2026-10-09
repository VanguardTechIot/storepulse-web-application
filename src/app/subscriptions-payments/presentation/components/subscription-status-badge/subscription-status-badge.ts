import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { Subscription } from '../../../domain/model/subscription.entity';
import { SubscriptionStatus } from '../../../domain/model/subscription-status.enum';

const TONES: Record<SubscriptionStatus, string> = {
  [SubscriptionStatus.PendingPayment]: 'badge--warning',
  [SubscriptionStatus.Active]: 'badge--success',
  [SubscriptionStatus.Cancelled]: 'badge--neutral',
  [SubscriptionStatus.Expired]: 'badge--danger',
};

/**
 * Status of the subscription; an active one without automatic renewal reads
 * "Active · will not renew" (mock-up 11c).
 */
@Component({
  selector: 'app-subscription-status-badge',
  imports: [TranslatePipe],
  template: `
    <span class="badge" [class]="tone()">
      {{ 'subscriptions.statuses.' + subscription().status | translate }}
      @if (subscription().isActive && !subscription().autoRenewal) {
        · {{ 'subscriptions.status.will_not_renew' | translate }}
      }
    </span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubscriptionStatusBadge {
  readonly subscription = input.required<Subscription>();

  protected readonly tone = computed(() => {
    const subscription = this.subscription();
    return subscription.isActive && !subscription.autoRenewal
      ? 'badge--warning'
      : TONES[subscription.status];
  });
}
