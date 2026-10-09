import { Payment } from '../model/payment.entity';
import { RegisterPaymentCommand } from '../model/register-payment.command';
import { Subscription } from '../model/subscription.entity';
import { SubscriptionPlan } from '../model/subscription-plan.entity';

/**
 * Access abstraction of Subscriptions and Payments. Mirrors the REST API of the context:
 * `/subscription-plans`, `/subscriptions/{galleryId}` and `/subscriptions/{galleryId}/payments`.
 * Business errors are thrown as `SubscriptionsError`.
 */
export interface SubscriptionsRepository {
  /** Published plans of the catalog. */
  listPlans(): Promise<SubscriptionPlan[]>;
  /** Subscription of the gallery, or `null` when it never contracted one. */
  findSubscriptionByGallery(galleryId: string): Promise<Subscription | null>;
  saveSubscription(subscription: Subscription): Promise<Subscription>;
  /** Payment history of the subscription, most recent first. */
  listPayments(subscriptionId: string): Promise<Payment[]>;
  /**
   * Sends the charge to the payment gateway and returns it resolved (TS-27).
   * Throws `gateway_unavailable` when the gateway does not answer.
   */
  registerPayment(command: RegisterPaymentCommand): Promise<Payment>;
}
