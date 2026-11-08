import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { KpiCard } from '../../../../shared/presentation/components/kpi-card/kpi-card';
import { PageState } from '../../../../shared/presentation/components/page-state/page-state';
import { LocalizedDatePipe } from '../../../../shared/presentation/pipes/localized-date.pipe';
import { LocalizedNumberPipe } from '../../../../shared/presentation/pipes/localized-number.pipe';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { UtilityBillingStore } from '../../../application/utility-billing.store';
import { UtilityBillStatus } from '../../../domain/enums/utility-bill-status.enum';
import { BillingStatusBadge } from '../../components/billing-status-badge/billing-status-badge';

type StatusFilter = UtilityBillStatus | 'ALL';

/** Bills of the units with their indicators, filtered by status. */
@Component({
  selector: 'app-utility-bill-list',
  imports: [
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatIconModule,
    MatTableModule,
    RouterLink,
    BillingStatusBadge,
    KpiCard,
    LocalizedDatePipe,
    LocalizedNumberPipe,
    PageState,
    TranslatePipe,
  ],
  templateUrl: './utility-bill-list.html',
  styleUrls: [
    '../../../../shared/presentation/styles/storepulse-theme.css',
    '../../../../shared/presentation/styles/page.css',
    '../billing.css',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UtilityBillList {
  protected readonly store = inject(UtilityBillingStore);
  protected readonly status = UtilityBillStatus;

  protected readonly filters: StatusFilter[] = ['ALL', ...Object.values(UtilityBillStatus)];
  protected readonly filter = signal<StatusFilter>('ALL');
  protected readonly columns = ['code', 'unit', 'period', 'total', 'status', 'actions'];

  protected readonly visibleBills = computed(() => {
    const filter = this.filter();
    return this.store.bills().filter((bill) => filter === 'ALL' || bill.status === filter);
  });

  constructor() {
    this.store.load().catch(() => undefined);
  }

  protected count(filter: StatusFilter): number {
    return this.store.countByStatus(filter === 'ALL' ? null : filter);
  }

  protected refresh(): void {
    this.store.load(true).catch(() => undefined);
  }
}
