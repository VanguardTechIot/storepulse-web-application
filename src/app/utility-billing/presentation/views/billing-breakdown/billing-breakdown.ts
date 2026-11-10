import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { Callout } from '../../../../shared/presentation/components/callout/callout';
import { PageState } from '../../../../shared/presentation/components/page-state/page-state';
import { StatusChip } from '../../../../shared/presentation/components/status-chip/status-chip';
import { LocalizedNumberPipe } from '../../../../shared/presentation/pipes/localized-number.pipe';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { UtilityBillingStore } from '../../../application/utility-billing.store';
import { BASELINE_ALERT_THRESHOLD } from '../../../domain/value-objects/billing-item.value-object';

/** Breakdown of a bill: consumption of each utility against the baseline of the unit. */
@Component({
  selector: 'app-billing-breakdown',
  imports: [
    MatButtonModule,
    MatCardModule,
    MatTableModule,
    RouterLink,
    Callout,
    LocalizedNumberPipe,
    PageState,
    StatusChip,
    TranslatePipe,
  ],
  templateUrl: './billing-breakdown.html',
  styleUrls: [
    '../../../../shared/presentation/styles/storepulse-theme.css',
    '../../../../shared/presentation/styles/page.css',
    '../billing.css',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BillingBreakdown {
  protected readonly store = inject(UtilityBillingStore);

  /** Route parameter. */
  readonly billId = input.required<string>();

  protected readonly threshold = BASELINE_ALERT_THRESHOLD * 100;
  protected readonly columns = [
    'utility',
    'consumption',
    'baseline',
    'variance',
    'rate',
    'amount',
    'state',
  ];
  protected readonly bill = computed(() => this.store.findBill(this.billId()));

  constructor() {
    this.store.load().catch(() => undefined);
  }

  protected refresh(): void {
    this.store.load(true).catch(() => undefined);
  }
}
