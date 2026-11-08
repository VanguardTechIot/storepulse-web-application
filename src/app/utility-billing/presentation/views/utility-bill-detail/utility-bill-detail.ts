import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { TranslationService } from '../../../../shared/infrastructure/i18n/translation.service';
import { Callout } from '../../../../shared/presentation/components/callout/callout';
import { PageState } from '../../../../shared/presentation/components/page-state/page-state';
import { ToastService } from '../../../../shared/presentation/components/toast-host/toast.service';
import { LocalizedDatePipe } from '../../../../shared/presentation/pipes/localized-date.pipe';
import { LocalizedNumberPipe } from '../../../../shared/presentation/pipes/localized-number.pipe';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { UtilityBillingStore } from '../../../application/utility-billing.store';
import { UtilityBillStatus } from '../../../domain/enums/utility-bill-status.enum';
import { BillingStatusBadge } from '../../components/billing-status-badge/billing-status-badge';

/** Life cycle shown as a timeline; a bill only reaches the last two steps after a dispute. */
const LIFECYCLE = Object.values(UtilityBillStatus);

/** Bill of a unit: its data, breakdown and disputes, plus the next step of its life cycle. */
@Component({
  selector: 'app-utility-bill-detail',
  imports: [
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatIconModule,
    MatProgressBarModule,
    MatTableModule,
    RouterLink,
    BillingStatusBadge,
    Callout,
    LocalizedDatePipe,
    LocalizedNumberPipe,
    PageState,
    TranslatePipe,
  ],
  templateUrl: './utility-bill-detail.html',
  styleUrls: [
    '../../../../shared/presentation/styles/storepulse-theme.css',
    '../../../../shared/presentation/styles/page.css',
    '../billing.css',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UtilityBillDetail {
  protected readonly store = inject(UtilityBillingStore);
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(TranslationService);

  /** Route parameter. */
  readonly billId = input.required<string>();

  protected readonly status = UtilityBillStatus;
  protected readonly steps = LIFECYCLE;
  protected readonly columns = ['utility', 'consumption', 'rate', 'amount'];
  protected readonly acceptIncompleteData = signal(false);

  protected readonly bill = computed(() => this.store.findBill(this.billId()));
  protected readonly disputes = computed(() => this.store.disputesOf(this.billId()));
  protected readonly currentStep = computed(() => {
    const bill = this.bill();
    return bill ? LIFECYCLE.indexOf(bill.status) : -1;
  });

  constructor() {
    this.store.clearError();
    this.store.load().catch(() => undefined);
  }

  protected refresh(): void {
    this.store.load(true).catch(() => undefined);
  }

  protected async verify(): Promise<void> {
    const bill = this.bill();
    if (!bill) return;
    if (await this.store.verifyData(bill, this.acceptIncompleteData())) {
      this.toast.show('success', this.i18n.t('billing.detail.verified'));
    }
  }

  protected async issue(): Promise<void> {
    const bill = this.bill();
    if (!bill) return;
    if (await this.store.issue(bill))
      this.toast.show('success', this.i18n.t('billing.detail.issued'));
  }
}
