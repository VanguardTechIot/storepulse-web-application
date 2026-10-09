import { CurrencyPipe, DecimalPipe, PercentPipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UtilityBillingStore } from '../../../application/utility-billing.store';
import { ConsumptionSummary } from '../../../domain/model/utility-bill.model';
import {
  BASELINE_ALERT_THRESHOLD,
  calculateCompleteness,
  FULL_DATA_COMPLETENESS,
  periodFromMonth,
  varianceRatio,
} from '../../../domain/model/billing-rules';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { errorKeyOf } from '../../utils/error-key';

const MONTH_OPTIONS = [
  { key: '2026-09', labelKey: 'billing.period.2026-09' },
  { key: '2026-10', labelKey: 'billing.period.2026-10' },
] as const;

@Component({
  selector: 'app-generate-utility-bill',
  imports: [FormsModule, RouterLink, CurrencyPipe, DecimalPipe, PercentPipe, TranslatePipe],
  templateUrl: './generate-utility-bill.html',
  styleUrl: '../../styles/billing.css',
})
export class GenerateUtilityBill implements OnInit {
  private readonly router = inject(Router);
  protected readonly store = inject(UtilityBillingStore);

  protected readonly monthOptions = MONTH_OPTIONS;
  protected readonly threshold = BASELINE_ALERT_THRESHOLD;
  protected readonly fullCompleteness = FULL_DATA_COMPLETENESS;
  protected readonly ratioOf = varianceRatio;

  protected unitId = '';
  protected month: string = MONTH_OPTIONS[1].key;

  protected readonly summary = signal<ConsumptionSummary | null>(null);
  protected readonly submitting = signal(false);
  protected readonly errorKey = signal<string | null>(null);

  protected readonly completeness = computed(() => {
    const current = this.summary();
    return current ? calculateCompleteness(current.utilities) : 0;
  });

  ngOnInit(): void {
    void this.store.load();
  }

  protected onUnitChange(unitId: string): void {
    this.unitId = unitId;
    void this.refreshSummary();
  }

  protected onMonthChange(month: string): void {
    this.month = month;
    void this.refreshSummary();
  }

  protected async generate(): Promise<void> {
    if (!this.unitId) {
      return;
    }
    this.submitting.set(true);
    this.errorKey.set(null);
    try {
      const bill = await this.store.generateBill(this.unitId, periodFromMonth(this.month));
      await this.router.navigate(['/billing/bills', bill.id]);
    } catch (error) {
      this.errorKey.set(errorKeyOf(error));
    } finally {
      this.submitting.set(false);
    }
  }

  private async refreshSummary(): Promise<void> {
    this.errorKey.set(null);
    if (!this.unitId) {
      this.summary.set(null);
      return;
    }
    try {
      const result = await this.store.loadConsumption(this.unitId, periodFromMonth(this.month));
      this.summary.set(result);
    } catch (error) {
      this.summary.set(null);
      this.errorKey.set(errorKeyOf(error));
    }
  }
}
