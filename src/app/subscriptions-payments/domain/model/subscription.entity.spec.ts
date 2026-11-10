import { BillingCycle } from '../enums/billing-cycle.enum';
import { BillingPeriod } from '../value-objects/billing-period.value-object';
import { Subscription, SubscriptionProps } from './subscription.entity';
import { SubscriptionStatus } from '../enums/subscription-status.enum';
import { SubscriptionsErrorCode } from './subscriptions-error';

describe('Subscription', () => {
  function subscription(changes: Partial<SubscriptionProps> = {}): Subscription {
    return Subscription.restore({
      id: '1',
      galleryId: 'gal-001',
      galleryAdministratorId: 'usr-001',
      planId: '2',
      status: SubscriptionStatus.Active,
      billingCycle: BillingCycle.Monthly,
      billingPeriod: new BillingPeriod(
        new Date('2026-10-15T05:00:00Z'),
        new Date('2026-11-15T05:00:00Z'),
      ),
      monitoredUnitCount: 12,
      autoRenewal: true,
      paymentMethodLabel: 'Visa •••• 4821',
      ...changes,
    });
  }

  it('cancels the renewal keeping the validity, and reactivates it', () => {
    const cancelled = subscription().cancelRenewal();

    expect(cancelled.isActive).toBe(true);
    expect(cancelled.autoRenewal).toBe(false);
    expect(() => cancelled.cancelRenewal()).toThrow(SubscriptionsErrorCode.RenewalAlreadyDisabled);
    expect(cancelled.reactivateRenewal().autoRenewal).toBe(true);
  });

  it('only changes the renewal of an active subscription', () => {
    const pending = subscription({
      status: SubscriptionStatus.PendingPayment,
      billingPeriod: null,
    });
    const expired = subscription({ status: SubscriptionStatus.Expired, autoRenewal: false });

    expect(() => pending.cancelRenewal()).toThrow(SubscriptionsErrorCode.SubscriptionNotActive);
    expect(() => expired.reactivateRenewal()).toThrow(SubscriptionsErrorCode.SubscriptionExpired);
  });

  it('reports the renewal as near within the last 10 days', () => {
    expect(subscription().isExpiringSoon(new Date('2026-11-01T05:00:00Z'))).toBe(false);
    expect(subscription().isExpiringSoon(new Date('2026-11-06T05:00:00Z'))).toBe(true);
  });
});
