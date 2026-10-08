import { DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UtilityBillingStore } from '../../../application/utility-billing.store';
import { BillingDisputeStatus } from '../../../domain/model/billing-dispute.model';
import { BillingStatusBadge } from '../../components/billing-status-badge/billing-status-badge';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';

type DisputeFilter = BillingDisputeStatus | 'ALL';

const DISPUTE_FILTERS: readonly DisputeFilter[] = ['ALL', 'OPEN', 'UNDER_REVIEW', 'RESOLVED'];

@Component({
  selector: 'app-billing-dispute-list',
  imports: [RouterLink, DatePipe, TranslatePipe, BillingStatusBadge],
  templateUrl: './billing-dispute-list.html',
  styleUrl: '../../styles/billing.css',
})
export class BillingDisputeList implements OnInit {
  protected readonly store = inject(UtilityBillingStore);
  protected readonly filters = DISPUTE_FILTERS;
  protected readonly activeFilter = signal<DisputeFilter>('ALL');

  protected readonly visibleDisputes = computed(() => {
    const filter = this.activeFilter();
    const disputes = this.store.disputes();
    return filter === 'ALL' ? disputes : disputes.filter((d) => d.status === filter);
  });

  ngOnInit(): void {
    void this.store.load();
  }

  protected setFilter(filter: DisputeFilter): void {
    this.activeFilter.set(filter);
  }

  protected billCodeOf(billId: string): string {
    return this.store.findBill(billId)?.code ?? '—';
  }

  protected unitOf(billId: string): string {
    const bill = this.store.findBill(billId);
    return bill ? `${bill.unitCode} · ${bill.unitName}` : '—';
  }
}
