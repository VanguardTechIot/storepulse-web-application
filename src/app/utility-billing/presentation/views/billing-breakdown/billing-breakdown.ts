import { CurrencyPipe, DecimalPipe, PercentPipe } from '@angular/common';
import { Component, computed, inject, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { UtilityBillingStore } from '../../../application/utility-billing.store';
import {
  BASELINE_ALERT_THRESHOLD,
  exceedsBaseline,
  varianceRatio,
} from '../../../domain/model/billing-rules';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';

@Component({
  selector: 'app-billing-breakdown',
  imports: [RouterLink, CurrencyPipe, DecimalPipe, PercentPipe, TranslatePipe],
  templateUrl: './billing-breakdown.html',
  styleUrl: '../../styles/billing.css',
})
export class BillingBreakdown implements OnInit {
  protected readonly store = inject(UtilityBillingStore);
  private readonly route = inject(ActivatedRoute);

  private readonly billId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('billId') ?? '')),
    { initialValue: '' },
  );

  protected readonly threshold = BASELINE_ALERT_THRESHOLD;
  protected readonly ratioOf = varianceRatio;
  protected readonly isAbove = exceedsBaseline;

  protected readonly bill = computed(() => this.store.findBill(this.billId()));

  protected readonly exceededCount = computed(
    () => this.bill()?.items.filter((item) => exceedsBaseline(item)).length ?? 0,
  );

  ngOnInit(): void {
    void this.store.load();
  }
}
