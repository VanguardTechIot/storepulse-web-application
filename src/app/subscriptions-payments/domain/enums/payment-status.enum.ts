/**
 * Result of the charge returned by the payment gateway.
 * The value doubles as the i18n key suffix (`subscriptions.payment_statuses.<status>`).
 */
export enum PaymentStatus {
  Pending = 'PENDING',
  Accepted = 'ACCEPTED',
  Rejected = 'REJECTED',
}
