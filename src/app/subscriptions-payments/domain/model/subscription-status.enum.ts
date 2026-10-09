/**
 * Lifecycle of the gallery subscription. The value doubles as the i18n key suffix
 * (`subscriptions.statuses.<status>`).
 */
export enum SubscriptionStatus {
  PendingPayment = 'PENDING_PAYMENT',
  Active = 'ACTIVE',
  Cancelled = 'CANCELLED',
  Expired = 'EXPIRED',
}
