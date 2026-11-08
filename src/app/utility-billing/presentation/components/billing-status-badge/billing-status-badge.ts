import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { StatusChip } from '../../../../shared/presentation/components/status-chip/status-chip';
import { Tone } from '../../../../shared/presentation/components/tone-icon/tone-icon';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { BillingDisputeStatus } from '../../../domain/enums/billing-dispute-status.enum';
import { UtilityBillStatus } from '../../../domain/enums/utility-bill-status.enum';

const BILL_TONES: Record<UtilityBillStatus, Tone> = {
  [UtilityBillStatus.Draft]: 'neutral',
  [UtilityBillStatus.DataVerified]: 'violet',
  [UtilityBillStatus.Issued]: 'info',
  [UtilityBillStatus.InDispute]: 'danger',
  [UtilityBillStatus.Resolved]: 'success',
};

const DISPUTE_TONES: Record<BillingDisputeStatus, Tone> = {
  [BillingDisputeStatus.Open]: 'danger',
  [BillingDisputeStatus.UnderReview]: 'warning',
  [BillingDisputeStatus.Resolved]: 'success',
};

/** Status of a bill or of a dispute, as a tinted chip. */
@Component({
  selector: 'app-billing-status-badge',
  imports: [StatusChip, TranslatePipe],
  templateUrl: './billing-status-badge.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BillingStatusBadge {
  readonly bill = input<UtilityBillStatus>();
  readonly dispute = input<BillingDisputeStatus>();

  protected readonly tone = computed<Tone>(() => {
    const bill = this.bill();
    const dispute = this.dispute();
    return bill ? BILL_TONES[bill] : dispute ? DISPUTE_TONES[dispute] : 'neutral';
  });

  protected readonly labelKey = computed(() =>
    this.bill() ? `billing.statuses.${this.bill()}` : `billing.dispute_statuses.${this.dispute()}`,
  );
}
