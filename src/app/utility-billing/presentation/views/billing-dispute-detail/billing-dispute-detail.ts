import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { RouterLink } from '@angular/router';
import { TranslationService } from '../../../../shared/infrastructure/i18n/translation.service';
import { Callout } from '../../../../shared/presentation/components/callout/callout';
import { PageState } from '../../../../shared/presentation/components/page-state/page-state';
import { ToastService } from '../../../../shared/presentation/components/toast-host/toast.service';
import { LocalizedDatePipe } from '../../../../shared/presentation/pipes/localized-date.pipe';
import { LocalizedNumberPipe } from '../../../../shared/presentation/pipes/localized-number.pipe';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { UtilityBillingStore } from '../../../application/utility-billing.store';
import { BillingDisputeStatus } from '../../../domain/enums/billing-dispute-status.enum';
import { DISPUTE_TEXT_MAX_LENGTH } from '../../../domain/model/billing-dispute.entity';
import { BillingStatusBadge } from '../../components/billing-status-badge/billing-status-badge';

/** Dispute of a tenant: the administrator reviews it and then resolves it. */
@Component({
  selector: 'app-billing-dispute-detail',
  imports: [
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatInputModule,
    RouterLink,
    BillingStatusBadge,
    Callout,
    LocalizedDatePipe,
    LocalizedNumberPipe,
    PageState,
    TranslatePipe,
  ],
  templateUrl: './billing-dispute-detail.html',
  styleUrls: [
    '../../../../shared/presentation/styles/storepulse-theme.css',
    '../../../../shared/presentation/styles/page.css',
    '../billing.css',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BillingDisputeDetail {
  protected readonly store = inject(UtilityBillingStore);
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(TranslationService);

  /** Route parameter. */
  readonly disputeId = input.required<string>();

  protected readonly status = BillingDisputeStatus;
  protected readonly maxLength = DISPUTE_TEXT_MAX_LENGTH;
  protected readonly reviewNotes = signal('');
  protected readonly resolution = signal('');

  protected readonly dispute = computed(() => this.store.findDispute(this.disputeId()));
  protected readonly bill = computed(() => {
    const dispute = this.dispute();
    return dispute ? this.store.findBill(dispute.utilityBillId) : undefined;
  });

  constructor() {
    this.store.clearError();
    this.store.load().catch(() => undefined);
  }

  protected refresh(): void {
    this.store.load(true).catch(() => undefined);
  }

  protected async review(): Promise<void> {
    const dispute = this.dispute();
    if (dispute && (await this.store.review(dispute, this.reviewNotes()))) {
      this.toast.show('success', this.i18n.t('billing.dispute.reviewed'));
    }
  }

  protected async resolve(): Promise<void> {
    const dispute = this.dispute();
    if (dispute && (await this.store.resolve(dispute, this.resolution()))) {
      this.toast.show('success', this.i18n.t('billing.dispute.resolved'));
    }
  }
}
