/**
 * Validity of the subscription, as reported by Subscriptions and Payments (TS-28).
 */
export enum SubscriptionStatus {
  Active = 'ACTIVE',
  ExpiringSoon = 'EXPIRING_SOON',
  Expired = 'EXPIRED',
}
