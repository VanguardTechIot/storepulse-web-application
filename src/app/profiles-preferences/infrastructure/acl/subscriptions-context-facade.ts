import { inject, Injectable } from '@angular/core';
import { IamStore } from '../../../iam/application/iam.store';
import { PROPERTY_MANAGEMENT_REPOSITORY } from '../../../property-management/infrastructure/property-management.token';
import { PlanCode } from '../../../subscriptions-payments/domain/model/subscription-plan.entity';
import { SUBSCRIPTIONS_REPOSITORY } from '../../../subscriptions-payments/infrastructure/repositories/subscriptions.token';
import { SubscriptionPlan } from '../../domain/model/subscription-plan.enum';
import { SubscriptionStatus } from '../../domain/model/subscription-status.enum';
import { SubscriptionSummary } from '../../domain/model/subscription-summary.value-object';

const plans: Record<PlanCode, SubscriptionPlan> = {
  BASIC: SubscriptionPlan.Basic,
  COMMERCIAL: SubscriptionPlan.Commercial,
  CORPORATE: SubscriptionPlan.Corporate,
};

/**
 * Anti-corruption layer towards Subscriptions and Payments: reads the subscription of the
 * administrator's gallery and translates it into the summary the profile shows.
 */
@Injectable({ providedIn: 'root' })
export class SubscriptionsContextFacade {
  private readonly iamStore = inject(IamStore);
  private readonly propertyRepository = inject(PROPERTY_MANAGEMENT_REPOSITORY);
  private readonly subscriptionsRepository = inject(SUBSCRIPTIONS_REPOSITORY);

  /** Router commands for managing the subscription plan and its renewal. */
  readonly manageRoute = ['/subscription'];

  /**
   * Retrieves the gallery subscription summary.
   *
   * @returns A promise that resolves to the summary, or `null` when the gallery has no paid
   * subscription.
   */
  async getSubscriptionSummary(): Promise<SubscriptionSummary | null> {
    const user = this.iamStore.currentUser();
    if (!user) return null;
    const gallery = await this.propertyRepository.findGallery();
    if (!gallery) return null;
    const [subscription, catalog] = await Promise.all([
      this.subscriptionsRepository.findSubscriptionByGallery(gallery.id),
      this.subscriptionsRepository.listPlans(),
    ]);
    const plan = catalog.find((candidate) => candidate.id === subscription?.planId);
    if (!subscription?.billingPeriod || !plan) return null;
    const status = subscription.isExpired
      ? SubscriptionStatus.Expired
      : subscription.isExpiringSoon()
        ? SubscriptionStatus.ExpiringSoon
        : subscription.isActive
          ? SubscriptionStatus.Active
          : null;
    if (!status) return null;
    return new SubscriptionSummary({
      plan: plans[plan.code],
      status,
      expiresAt: subscription.billingPeriod.endDate,
      autoRenewal: subscription.autoRenewal,
    });
  }
}
