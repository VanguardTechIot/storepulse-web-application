import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { PageState } from '../../../../shared/presentation/components/page-state/page-state';
import { LocalizedDatePipe } from '../../../../shared/presentation/pipes/localized-date.pipe';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { UtilityBillingStore } from '../../../application/utility-billing.store';
import { BillingDisputeStatus } from '../../../domain/enums/billing-dispute-status.enum';
import { BillingStatusBadge } from '../../components/billing-status-badge/billing-status-badge';

type StatusFilter = BillingDisputeStatus | 'ALL';

/** Disputes raised by the tenants over their bills, filtered by status. */
@Component({
  selector: 'app-billing-dispute-list',
  imports: [
    MatButtonToggleModule,
    MatCardModule,
    MatTableModule,
    RouterLink,
    BillingStatusBadge,
    LocalizedDatePipe,
    PageState,
    TranslatePipe,
  ],
  templateUrl: './billing-dispute-list.html',
  styleUrls: [
    '../../../../shared/presentation/styles/storepulse-theme.css',
    '../../../../shared/presentation/styles/page.css',
    '../billing.css',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BillingDisputeList {
  protected readonly store = inject(UtilityBillingStore);

  protected readonly filters: StatusFilter[] = ['ALL', ...Object.values(BillingDisputeStatus)];
  protected readonly filter = signal<StatusFilter>('ALL');
  protected readonly columns = [
    'dispute',
    'bill',
    'unit',
    'reason',
    'created',
    'status',
    'actions',
  ];

  protected readonly visibleDisputes = computed(() => {
    const filter = this.filter();
    return this.store.disputes().filter((d) => filter === 'ALL' || d.status === filter);
  });

  constructor() {
    this.store.load().catch(() => undefined);
  }

  protected count(filter: StatusFilter): number {
    return this.store.disputes().filter((d) => filter === 'ALL' || d.status === filter).length;
  }

  protected refresh(): void {
    this.store.load(true).catch(() => undefined);
  }
}
