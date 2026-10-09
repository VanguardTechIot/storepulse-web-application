import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { Router } from '@angular/router';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { SubscriptionsStore } from '../../../application/subscriptions.store';
import { BillingCycle } from '../../../domain/model/billing-cycle.enum';
import { SubscriptionPlan } from '../../../domain/model/subscription-plan.entity';
import { PlanCard } from '../../components/plan-card/plan-card';
import { SubscriptionState } from '../../components/subscription-state/subscription-state';

/**
 * Catalog of plans tiered by monitored units, with monthly or annual prices (US-44, mock-up 11).
 */
@Component({
  selector: 'app-plan-catalog',
  imports: [MatButtonToggleModule, PlanCard, SubscriptionState, TranslatePipe],
  templateUrl: './plan-catalog.html',
  styleUrl: '../../styles/subscriptions.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanCatalog {
  protected readonly store = inject(SubscriptionsStore);
  private readonly router = inject(Router);

  protected readonly cycles = [BillingCycle.Monthly, BillingCycle.Annual];
  protected readonly cycle = signal<BillingCycle>(
    this.store.subscription()?.billingCycle ?? BillingCycle.Monthly,
  );

  protected isCurrent(plan: SubscriptionPlan): boolean {
    const subscription = this.store.subscription();
    return (
      !!subscription?.isActive &&
      subscription.planId === plan.id &&
      subscription.billingCycle === this.cycle()
    );
  }

  protected choose(plan: SubscriptionPlan): void {
    this.router.navigate(['/subscription/checkout', plan.id], {
      queryParams: { cycle: this.cycle() },
    });
  }
}
