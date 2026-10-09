import { BillingCycle } from './billing-cycle.enum';
import { Money } from './money.value-object';
import { Subscription } from './subscription.entity';
import { SubscriptionPlan } from './subscription-plan.entity';
import { SubscriptionStatus } from './subscription-status.enum';
import { SubscriptionsError, SubscriptionsErrorCode } from './subscriptions-error';

describe('Subscription', () => {
  const basic = new SubscriptionPlan(
    'pln-basic',
    'BASIC',
    30,
    new Money(290),
    new Money(2900),
    [],
    true,
  );
  const commercial = new SubscriptionPlan(
    'pln-commercial',
    'COMMERCIAL',
    100,
    new Money(690),
    new Money(6900),
    [],
    true,
  );

  function request(units = 12): Subscription {
    return Subscription.request({
      id: 'sub-1',
      galleryId: 'gal-001',
      galleryAdministratorId: 'usr-001',
      plan: commercial,
      billingCycle: BillingCycle.Monthly,
      monitoredUnitCount: units,
    });
  }

  function errorOf(change: () => unknown): SubscriptionsErrorCode | null {
    try {
      change();
      return null;
    } catch (error) {
      return error instanceof SubscriptionsError ? error.code : null;
    }
  }

  it('is created pending until the gateway accepts the charge (US-44)', () => {
    const subscription = request();

    expect(subscription.status).toBe(SubscriptionStatus.PendingPayment);
    expect(subscription.billingPeriod).toBeNull();
  });

  it('activates with a period of one cycle and automatic renewal on', () => {
    const start = new Date('2026-10-15T05:00:00Z');
    const active = request().activate(commercial, BillingCycle.Monthly, 'Visa •••• 4821', start);

    expect(active.isActive).toBe(true);
    expect(active.autoRenewal).toBe(true);
    expect(active.billingPeriod?.endDate.toISOString()).toBe('2026-11-15T05:00:00.000Z');
  });

  it('rejects a plan that does not cover the monitored units', () => {
    expect(errorOf(() => request(40).activate(basic, BillingCycle.Monthly, 'Visa'))).toBe(
      SubscriptionsErrorCode.UnitLimitExceeded,
    );
  });

  it('cancels the renewal keeping the validity, and reactivates it (US-46, US-47)', () => {
    const active = request().activate(commercial, BillingCycle.Monthly, 'Visa');
    const cancelled = active.cancelRenewal();

    expect(cancelled.isActive).toBe(true);
    expect(cancelled.autoRenewal).toBe(false);
    expect(errorOf(() => cancelled.cancelRenewal())).toBe(
      SubscriptionsErrorCode.RenewalAlreadyDisabled,
    );
    expect(cancelled.reactivateRenewal().autoRenewal).toBe(true);
  });

  it('reports the renewal as near within the last 10 days (US-45, scenario 2)', () => {
    const active = request().activate(
      commercial,
      BillingCycle.Monthly,
      'Visa',
      new Date('2026-10-15T05:00:00Z'),
    );

    expect(active.isExpiringSoon(new Date('2026-11-01T05:00:00Z'))).toBe(false);
    expect(active.isExpiringSoon(new Date('2026-11-06T05:00:00Z'))).toBe(true);
  });
});
