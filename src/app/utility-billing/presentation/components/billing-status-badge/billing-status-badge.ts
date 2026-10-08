import { Component, computed, input } from '@angular/core';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';

export type BillingBadgeKind = 'bill' | 'dispute';

const TONE_BY_STATUS: Record<string, string> = {
  DRAFT: 'badge--neutral',
  DATA_VERIFIED: 'badge--violet',
  ISSUED: 'badge--warning',
  IN_DISPUTE: 'badge--danger',
  RESOLVED: 'badge--success',
  OPEN: 'badge--danger',
  UNDER_REVIEW: 'badge--warning',
};

@Component({
  selector: 'app-billing-status-badge',
  imports: [TranslatePipe],
  template: `<span class="badge {{ tone() }}">{{ labelKey() | translate }}</span>`,
})
export class BillingStatusBadge {
  readonly status = input.required<string>();
  readonly kind = input<BillingBadgeKind>('bill');

  protected readonly tone = computed(() => TONE_BY_STATUS[this.status()] ?? 'badge--neutral');

  protected readonly labelKey = computed(() =>
    this.kind() === 'bill'
      ? `billing.bill_status.${this.status()}`
      : `billing.dispute_status.${this.status()}`,
  );
}
