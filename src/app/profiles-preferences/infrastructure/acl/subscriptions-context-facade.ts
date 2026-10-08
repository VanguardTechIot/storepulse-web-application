import { Injectable } from '@angular/core';
import { SubscriptionPlan } from '../../domain/model/subscription-plan.enum';
import { SubscriptionStatus } from '../../domain/model/subscription-status.enum';
import { SubscriptionSummary } from '../../domain/model/subscription-summary.value-object';

/**
 * Anti-corruption layer towards Subscriptions and Payments (US-45).
 *
 * That context is not implemented yet, so this facade answers with the sample subscription of
 * mock-up 12. When it exists, only this class changes: read the gallery subscription from that
 * context (TS-28, `GET /subscriptions/{galleryId}/status`) and translate it to the summary.
 */
@Injectable({ providedIn: 'root' })
export class SubscriptionsContextFacade {
  /** Subscription screen, where the administrator manages the plan and its renewal. */
  readonly manageRoute = ['/subscription'];

  async getSubscriptionSummary(): Promise<SubscriptionSummary | null> {
    return new SubscriptionSummary({
      plan: SubscriptionPlan.Commercial,
      status: SubscriptionStatus.Active,
      expiresAt: new Date('2026-11-15T05:00:00Z'),
      autoRenewal: true,
    });
  }
}
