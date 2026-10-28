import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PageState } from '../../../../shared/presentation/components/page-state/page-state';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { StatusChip } from '../../../../shared/presentation/components/status-chip/status-chip';
import { Tone } from '../../../../shared/presentation/components/tone-icon/tone-icon';
import { LocalizedDatePipe } from '../../../../shared/presentation/pipes/localized-date.pipe';
import { LocalizedNumberPipe } from '../../../../shared/presentation/pipes/localized-number.pipe';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { SubscriptionsStore } from '../../../application/subscriptions.store';
import { PaymentStatus } from '../../../domain/enums/payment-status.enum';
import { SubscriptionState } from '../../components/subscription-state/subscription-state';

const STATUS_TONES: Record<PaymentStatus, Tone> = {
  [PaymentStatus.Pending]: 'warning',
  [PaymentStatus.Accepted]: 'success',
  [PaymentStatus.Rejected]: 'danger',
};

/**
 * Charges of the subscription processed by the payment gateway.
 */
@Component({
  selector: 'app-payment-history',
  imports: [
    SubscriptionState,
    TranslatePipe,
    LocalizedDatePipe,
    LocalizedNumberPipe,
    MatCardModule,
    MatTableModule,
    PageState,
    StatusChip,
  ],
  templateUrl: './payment-history.html',
  styleUrls: ['../../../../shared/presentation/styles/page.css', '../subscriptions.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentHistory {
  protected readonly store = inject(SubscriptionsStore);
  protected readonly columns = ['receipt', 'date', 'concept', 'method', 'amount', 'status'];

  protected statusTone(status: PaymentStatus): Tone {
    return STATUS_TONES[status];
  }
}
