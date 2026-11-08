import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { Router, RouterLink } from '@angular/router';
import { Callout } from '../../../../shared/presentation/components/callout/callout';
import { PageState } from '../../../../shared/presentation/components/page-state/page-state';
import { LocalizedDatePipe } from '../../../../shared/presentation/pipes/localized-date.pipe';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { UtilityBillingStore } from '../../../application/utility-billing.store';
import { BillingMonth } from '../../../domain/value-objects/billing-month.value-object';

/** Closed months the administrator can bill. */
const BILLABLE_MONTHS = 6;

/** Asks the platform for the draft bill of a unit and month; it computes the breakdown. */
@Component({
  selector: 'app-generate-utility-bill',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatSelectModule,
    RouterLink,
    Callout,
    LocalizedDatePipe,
    PageState,
    TranslatePipe,
  ],
  templateUrl: './generate-utility-bill.html',
  styleUrls: [
    '../../../../shared/presentation/styles/storepulse-theme.css',
    '../../../../shared/presentation/styles/page.css',
    '../billing.css',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenerateUtilityBill {
  protected readonly store = inject(UtilityBillingStore);
  private readonly router = inject(Router);

  protected readonly months = BillingMonth.recent(BILLABLE_MONTHS);
  protected readonly form = inject(NonNullableFormBuilder).group({
    unitId: ['', Validators.required],
    period: [this.months[0].value, Validators.required],
  });

  constructor() {
    this.store.clearError();
    this.store.load().catch(() => undefined);
  }

  protected refresh(): void {
    this.store.load(true).catch(() => undefined);
  }

  protected async generate(): Promise<void> {
    const { unitId, period } = this.form.getRawValue();
    const unit = this.store.units().find((u) => u.id === unitId);
    const month = this.months.find((m) => m.value === period);
    if (this.form.invalid || !unit || !month) {
      this.form.markAllAsTouched();
      return;
    }
    const bill = await this.store.generate(unit, month);
    if (bill) await this.router.navigate(['/billing/bills', bill.id]);
  }
}
