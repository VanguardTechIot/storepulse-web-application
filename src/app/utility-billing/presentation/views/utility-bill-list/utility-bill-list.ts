import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UtilityBillingStore } from '../../../application/utility-billing.store';
import { UtilityBillStatus } from '../../../domain/model/utility-bill.model';
import { BillingStatusBadge } from '../../components/billing-status-badge/billing-status-badge';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';

type StatusFilter = UtilityBillStatus | 'ALL';

const STATUS_FILTERS: readonly StatusFilter[] = [
  'ALL',
  'DRAFT',
  'DATA_VERIFIED',
  'ISSUED',
  'IN_DISPUTE',
  'RESOLVED',
];

@Component({
  selector: 'app-utility-bill-list',
  imports: [RouterLink, CurrencyPipe, DatePipe, TranslatePipe, BillingStatusBadge],
  templateUrl: './utility-bill-list.html',
  styleUrl: '../../styles/billing.css',
})
export class UtilityBillList implements OnInit {
  protected readonly store = inject(UtilityBillingStore);
  protected readonly filters = STATUS_FILTERS;
  protected readonly activeFilter = signal<StatusFilter>('ALL');

  protected readonly visibleBills = computed(() => {
    const filter = this.activeFilter();
    const bills = this.store.bills();
    return filter === 'ALL' ? bills : bills.filter((b) => b.status === filter);
  });

  ngOnInit(): void {
    void this.store.load();
  }

  protected setFilter(filter: StatusFilter): void {
    this.activeFilter.set(filter);
  }
}
