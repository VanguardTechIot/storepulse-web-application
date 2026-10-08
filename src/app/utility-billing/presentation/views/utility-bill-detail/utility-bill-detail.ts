import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { UtilityBillingStore } from '../../../application/utility-billing.store';
import { UtilityBillStatus } from '../../../domain/model/utility-bill.model';
import { FULL_DATA_COMPLETENESS, varianceRatio } from '../../../domain/model/billing-rules';
import { BillingStatusBadge } from '../../components/billing-status-badge/billing-status-badge';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { errorKeyOf } from '../../utils/error-key';

const LIFECYCLE: readonly UtilityBillStatus[] = [
  'DRAFT',
  'DATA_VERIFIED',
  'ISSUED',
  'IN_DISPUTE',
  'RESOLVED',
];

@Component({
  selector: 'app-utility-bill-detail',
  imports: [
    FormsModule,
    RouterLink,
    CurrencyPipe,
    DatePipe,
    DecimalPipe,
    TranslatePipe,
    BillingStatusBadge,
  ],
  templateUrl: './utility-bill-detail.html',
  styleUrl: '../../styles/billing.css',
})
export class UtilityBillDetail implements OnInit {
  protected readonly store = inject(UtilityBillingStore);
  private readonly route = inject(ActivatedRoute);

  private readonly billId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('billId') ?? '')),
    { initialValue: '' },
  );

  protected readonly steps = LIFECYCLE;
  protected readonly fullCompleteness = FULL_DATA_COMPLETENESS;
  protected readonly ratioOf = varianceRatio;

  protected readonly bill = computed(() => this.store.findBill(this.billId()));
  protected readonly disputes = computed(() => this.store.disputesForBill(this.billId()));
  protected readonly currentIndex = computed(() => {
    const current = this.bill();
    return current ? LIFECYCLE.indexOf(current.status) : -1;
  });

  protected acceptIncompleteData = false;
  protected readonly busy = signal(false);
  protected readonly actionError = signal<string | null>(null);

  ngOnInit(): void {
    void this.store.load();
  }

  protected async verify(): Promise<void> {
    await this.run(() => this.store.verifyData(this.billId(), this.acceptIncompleteData));
  }

  protected async issue(): Promise<void> {
    await this.run(() => this.store.issueBill(this.billId()));
  }

  private async run(action: () => Promise<void>): Promise<void> {
    this.busy.set(true);
    this.actionError.set(null);
    try {
      await action();
    } catch (error) {
      this.actionError.set(errorKeyOf(error));
    } finally {
      this.busy.set(false);
    }
  }
}
