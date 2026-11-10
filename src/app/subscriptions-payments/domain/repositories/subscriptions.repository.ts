import { GalleryReference } from '../model/gallery-reference';
import { Payment } from '../model/payment.entity';
import { RequestSubscriptionCommand } from '../model/request-subscription.command';
import { Subscription } from '../model/subscription.entity';
import { SubscriptionPlan } from '../model/subscription-plan.entity';

/**
 * Access abstraction of Subscriptions and Payments. Mirrors the REST API of the context:
 * `/subscription-plans`, `/subscriptions` and `/subscriptions/{id}/payments`.
 * Business errors are thrown as `SubscriptionsError`.
 */
export interface SubscriptionsRepository {
  /** Published plans of the catalog. */
  listPlans(): Promise<SubscriptionPlan[]>;
  /** Subscription of the gallery, or `null` when it never contracted one. */
  findSubscriptionByGallery(galleryId: string): Promise<Subscription | null>;
  /**
   * Contracts or changes the plan and charges it. Throws `payment_rejected` when the gateway
   * declines the card; the rejected charge is still recorded in the payment history.
   */
  requestSubscription(
    gallery: GalleryReference,
    command: RequestSubscriptionCommand,
  ): Promise<Subscription>;
  cancelRenewal(subscriptionId: string): Promise<Subscription>;
  reactivateRenewal(subscriptionId: string): Promise<Subscription>;
  /** Payment history of the subscription, most recent first. */
  listPayments(subscriptionId: string): Promise<Payment[]>;
}
