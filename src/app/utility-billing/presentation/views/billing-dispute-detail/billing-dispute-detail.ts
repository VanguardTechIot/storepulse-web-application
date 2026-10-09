import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { UtilityBillingStore } from '../../../application/utility-billing.store';
import { BillingStatusBadge } from '../../components/billing-status-badge/billing-status-badge';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { errorKeyOf } from '../../utils/error-key';

@Component({
  selector: 'app-billing-dispute-detail',
  imports: [FormsModule, RouterLink, CurrencyPipe, DatePipe, TranslatePipe, BillingStatusBadge],
  templateUrl: './billing-dispute-detail.html',
  styleUrl: '../../styles/billing.css',
})
export class BillingDisputeDetail implements OnInit {
  protected readonly store = inject(UtilityBillingStore);
  private readonly route = inject(ActivatedRoute);

  private readonly disputeId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('disputeId') ?? '')),
    { initialValue: '' },
  );

  protected readonly dispute = computed(() => this.store.findDispute(this.disputeId()));

  protected readonly bill = computed(() => {
    const current = this.dispute();
    return current ? this.store.findBill(current.billId) : undefined;
  });

  protected reviewNotes = '';
  protected resolutionText = '';
  protected readonly busy = signal(false);
  protected readonly actionError = signal<string | null>(null);

  ngOnInit(): void {
    void this.store.load();
  }

  protected async startReview(): Promise<void> {
    await this.run(() => this.store.startDisputeReview(this.disputeId(), this.reviewNotes));
  }

  protected async resolve(): Promise<void> {
    await this.run(() => this.store.resolveDispute(this.disputeId(), this.resolutionText));
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
