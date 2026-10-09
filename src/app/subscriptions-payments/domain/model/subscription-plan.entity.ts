import { BaseEntity } from '../../../shared/domain/model/base-entity';
import { BillingCycle } from './billing-cycle.enum';
import { Money } from './money.value-object';

/** Commercial plans of the catalog (mock-up 11). Doubles as i18n key (`subscriptions.plans.<code>`). */
export type PlanCode = 'BASIC' | 'COMMERCIAL' | 'CORPORATE';

/**
 * Aggregate root: plan published in the catalog, tiered by the number of monitored units.
 */
export class SubscriptionPlan implements BaseEntity {
  constructor(
    readonly id: string,
    readonly code: PlanCode,
    /** Maximum monitored units; `null` means unlimited (Corporate plan). */
    readonly monitoredUnitLimit: number | null,
    readonly monthlyPrice: Money,
    readonly annualPrice: Money,
    /** Feature keys, translated as `subscriptions.features.<key>`. */
    readonly features: readonly string[],
    readonly published: boolean,
  ) {}

  get isUnlimited(): boolean {
    return this.monitoredUnitLimit === null;
  }

  /** The plan covers the units the gallery already monitors. */
  allowsUnits(count: number): boolean {
    return this.monitoredUnitLimit === null || count <= this.monitoredUnitLimit;
  }

  priceFor(cycle: BillingCycle): Money {
    return cycle === BillingCycle.Annual ? this.annualPrice : this.monthlyPrice;
  }
}
