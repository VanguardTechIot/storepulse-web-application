/**
 * Validity of the subscription, as reported by Subscriptions and Payments.
 */
export enum SubscriptionStatus {
  /** The subscription is active. */
  Active = 'ACTIVE',
  /** The subscription is nearing its expiration date. */
  ExpiringSoon = 'EXPIRING_SOON',
  /** The subscription has expired. */
  Expired = 'EXPIRED',
}
