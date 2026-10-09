/**
 * Business outcomes that prevent a subscription operation from completing.
 * The value doubles as the i18n key suffix (`subscriptions.errors.<code>`).
 */
export enum SubscriptionsErrorCode {
  GalleryNotRegistered = 'gallery_not_registered',
  PlanNotFound = 'plan_not_found',
  SubscriptionNotFound = 'subscription_not_found',
  UnitLimitExceeded = 'unit_limit_exceeded',
  InvalidAmount = 'invalid_amount',
  InvalidPeriod = 'invalid_period',
  InvalidCard = 'invalid_card',
  PaymentRejected = 'payment_rejected',
  GatewayUnavailable = 'gateway_unavailable',
  SubscriptionNotActive = 'subscription_not_active',
  SubscriptionExpired = 'subscription_expired',
  RenewalAlreadyDisabled = 'renewal_already_disabled',
  RenewalAlreadyEnabled = 'renewal_already_enabled',
  Unexpected = 'unexpected',
}

export class SubscriptionsError extends Error {
  constructor(readonly code: SubscriptionsErrorCode) {
    super(code);
    this.name = 'SubscriptionsError';
  }
}
