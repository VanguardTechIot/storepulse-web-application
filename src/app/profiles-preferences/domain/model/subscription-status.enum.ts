/**
 * Validity of the subscription, as reported by Subscriptions and Payments (TS-28).
 */
export enum SubscriptionStatus {
  /** The subscription is active. */
  Active = 'ACTIVE',
  /** The subscription is nearing its expiration date. */
  ExpiringSoon = 'EXPIRING_SOON',
  /** The subscription has expired. */
  Expired = 'EXPIRED',
}
