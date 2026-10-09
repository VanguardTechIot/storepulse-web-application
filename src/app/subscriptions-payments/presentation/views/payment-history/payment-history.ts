import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { LocalizedDatePipe } from '../../../../shared/presentation/pipes/localized-date.pipe';
import { LocalizedNumberPipe } from '../../../../shared/presentation/pipes/localized-number.pipe';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { SubscriptionsStore } from '../../../application/subscriptions.store';
import { PaymentStatus } from '../../../domain/model/payment-status.enum';
import { SubscriptionState } from '../../components/subscription-state/subscription-state';

const STATUS_TONES: Record<PaymentStatus, string> = {
  [PaymentStatus.Pending]: 'badge--warning',
  [PaymentStatus.Accepted]: 'badge--success',
  [PaymentStatus.Rejected]: 'badge--danger',
};

/**
 * Charges of the subscription processed by the payment gateway (mock-up 11, "Payment history").
 */
@Component({
  selector: 'app-payment-history',
  imports: [
    MatIconModule,
    SubscriptionState,
    TranslatePipe,
    LocalizedDatePipe,
    LocalizedNumberPipe,
  ],
  templateUrl: './payment-history.html',
  styleUrl: '../../styles/subscriptions.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentHistory {
  protected readonly store = inject(SubscriptionsStore);
  protected readonly statusTones = STATUS_TONES;
}
