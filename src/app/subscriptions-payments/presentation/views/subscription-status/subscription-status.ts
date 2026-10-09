import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterLink } from '@angular/router';
import { TranslationService } from '../../../../shared/infrastructure/i18n/translation.service';
import { Callout } from '../../../../shared/presentation/components/callout/callout';
import { ConfirmDialog } from '../../../../shared/presentation/components/confirm-dialog/confirm-dialog';
import { ToastService } from '../../../../shared/presentation/components/toast-host/toast.service';
import { LocalizedDatePipe } from '../../../../shared/presentation/pipes/localized-date.pipe';
import { LocalizedNumberPipe } from '../../../../shared/presentation/pipes/localized-number.pipe';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { SubscriptionsStore } from '../../../application/subscriptions.store';
import { SubscriptionState } from '../../components/subscription-state/subscription-state';
import { SubscriptionStatusBadge } from '../../components/subscription-status-badge/subscription-status-badge';

/**
 * Current subscription of the gallery: plan, status, expiration date, covered units and automatic
 * renewal (US-45 to US-48, mock-ups 11, 11b and 11c).
 */
@Component({
  selector: 'app-subscription-status',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    RouterLink,
    Callout,
    ConfirmDialog,
    SubscriptionState,
    SubscriptionStatusBadge,
    TranslatePipe,
    LocalizedDatePipe,
    LocalizedNumberPipe,
  ],
  templateUrl: './subscription-status.html',
  styleUrl: '../../styles/subscriptions.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubscriptionStatusView {
  protected readonly store = inject(SubscriptionsStore);
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(TranslationService);

  protected readonly confirmingCancel = signal(false);

  /** Percentage of the plan limit already used by the gallery (0 for unlimited plans). */
  protected readonly usage = computed(() => {
    const limit = this.store.currentPlan()?.monitoredUnitLimit;
    return limit ? Math.min(100, (this.store.monitoredUnitCount() / limit) * 100) : 0;
  });

  protected async cancelRenewal(): Promise<void> {
    const done = await this.store.cancelRenewal();
    this.confirmingCancel.set(false);
    this.notify(done, 'subscriptions.status.renewal_cancelled');
  }

  protected async reactivateRenewal(): Promise<void> {
    const done = await this.store.reactivateRenewal();
    this.notify(done, 'subscriptions.status.renewal_reactivated');
  }

  private notify(done: boolean, successKey: string): void {
    const error = this.store.error();
    if (done) this.toast.show('success', this.i18n.t(successKey));
    else if (error) this.toast.show('error', this.i18n.t('subscriptions.errors.' + error));
  }
}
