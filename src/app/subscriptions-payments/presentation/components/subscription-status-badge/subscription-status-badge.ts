import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { StatusChip } from '../../../../shared/presentation/components/status-chip/status-chip';
import { Tone } from '../../../../shared/presentation/components/tone-icon/tone-icon';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { SubscriptionStatus } from '../../../domain/enums/subscription-status.enum';
import { Subscription } from '../../../domain/model/subscription.entity';

const TONES: Record<SubscriptionStatus, Tone> = {
  [SubscriptionStatus.PendingPayment]: 'warning',
  [SubscriptionStatus.Active]: 'success',
  [SubscriptionStatus.Cancelled]: 'neutral',
  [SubscriptionStatus.Expired]: 'danger',
};

/** Subscription status; an active one without automatic renewal reads "Active · will not renew". */
@Component({
  selector: 'app-subscription-status-badge',
  imports: [StatusChip, TranslatePipe],
  templateUrl: './subscription-status-badge.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubscriptionStatusBadge {
  readonly subscription = input.required<Subscription>();

  protected readonly tone = computed<Tone>(() => {
    const subscription = this.subscription();
    return subscription.isActive && !subscription.autoRenewal
      ? 'warning'
      : TONES[subscription.status];
  });
}
