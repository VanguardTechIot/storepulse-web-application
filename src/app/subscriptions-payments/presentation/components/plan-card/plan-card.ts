import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LocalizedNumberPipe } from '../../../../shared/presentation/pipes/localized-number.pipe';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { BillingCycle } from '../../../domain/model/billing-cycle.enum';
import { SubscriptionPlan } from '../../../domain/model/subscription-plan.entity';

/**
 * Plan of the catalog with its price for the selected cycle, its unit limit and its features.
 */
@Component({
  selector: 'app-plan-card',
  imports: [MatButtonModule, MatIconModule, TranslatePipe, LocalizedNumberPipe],
  templateUrl: './plan-card.html',
  styleUrl: './plan-card.css',
  host: { '[class.current]': 'current()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanCard {
  readonly plan = input.required<SubscriptionPlan>();
  readonly cycle = input.required<BillingCycle>();
  /** The gallery is subscribed to this plan. */
  readonly current = input(false);
  /** Units the gallery monitors today: a smaller plan cannot be chosen (unit_limit_exceeded). */
  readonly monitoredUnitCount = input(0);

  readonly selected = output<SubscriptionPlan>();

  protected readonly price = computed(() => this.plan().priceFor(this.cycle()));
  protected readonly fits = computed(() => this.plan().allowsUnits(this.monitoredUnitCount()));
  protected readonly annual = computed(() => this.cycle() === BillingCycle.Annual);
}
