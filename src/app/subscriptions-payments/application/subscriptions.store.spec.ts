import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BillingCycle } from '../domain/enums/billing-cycle.enum';
import { PaymentMethod } from '../domain/enums/payment-method.enum';
import { PaymentStatus } from '../domain/enums/payment-status.enum';
import { SubscriptionStatus } from '../domain/enums/subscription-status.enum';
import { Payment } from '../domain/model/payment.entity';
import { RequestSubscriptionCommand } from '../domain/model/request-subscription.command';
import { Subscription } from '../domain/model/subscription.entity';
import { SubscriptionPlan } from '../domain/model/subscription-plan.entity';
import { SubscriptionsError, SubscriptionsErrorCode } from '../domain/model/subscriptions-error';
import { SubscriptionsRepository } from '../domain/repositories/subscriptions.repository';
import { Money } from '../domain/value-objects/money.value-object';
import { IamContextFacade } from '../infrastructure/acl/iam-context-facade';
import { PropertyContextFacade } from '../infrastructure/acl/property-context-facade';
import { SUBSCRIPTIONS_REPOSITORY } from '../infrastructure/repositories/subscriptions.token';
import { SubscriptionsStore } from './subscriptions.store';

describe('SubscriptionsStore', () => {
  const basic = new SubscriptionPlan('1', 'BASIC', 30, new Money(290), new Money(2900), [], true);
  const gallery = { galleryId: 'gal-001', name: 'Galería Central', monitoredUnitCount: 12 };

  let repository: { [K in keyof SubscriptionsRepository]: ReturnType<typeof vi.fn> };
  let store: SubscriptionsStore;

  function subscription(status: SubscriptionStatus): Subscription {
    return Subscription.restore({
      id: '1',
      galleryId: gallery.galleryId,
      galleryAdministratorId: 'usr-001',
      planId: basic.id,
      status,
      billingCycle: BillingCycle.Monthly,
      billingPeriod: null,
      monitoredUnitCount: gallery.monitoredUnitCount,
      autoRenewal: true,
      paymentMethodLabel: null,
    });
  }

  function payment(status: PaymentStatus): Payment {
    return new Payment(
      '1',
      '1',
      null,
      basic.id,
      BillingCycle.Monthly,
      basic.monthlyPrice,
      PaymentMethod.CreditCard,
      'Visa •••• 4821',
      status,
      null,
      new Date(),
    );
  }

  function subscribeCommand(planId = basic.id): RequestSubscriptionCommand {
    return new RequestSubscriptionCommand({
      planId,
      billingCycle: BillingCycle.Monthly,
      paymentMethod: PaymentMethod.CreditCard,
      cardNumber: '4111111111114821',
      cardExpiry: '12/30',
    });
  }

  beforeEach(() => {
    repository = {
      listPlans: vi.fn(async () => [basic]),
      findSubscriptionByGallery: vi.fn(async () => null),
      requestSubscription: vi.fn(async () => subscription(SubscriptionStatus.Active)),
      cancelRenewal: vi.fn(),
      reactivateRenewal: vi.fn(),
      listPayments: vi.fn(async () => [payment(PaymentStatus.Accepted)]),
    };
    TestBed.configureTestingModule({
      providers: [
        { provide: SUBSCRIPTIONS_REPOSITORY, useValue: repository },
        { provide: IamContextFacade, useValue: { currentAdministratorId: signal('usr-001') } },
        {
          provide: PropertyContextFacade,
          useValue: { galleryRegistrationRoute: [], getGalleryOf: vi.fn(async () => gallery) },
        },
      ],
    });
    store = TestBed.inject(SubscriptionsStore);
  });

  it('loads the catalog and the gallery without a subscription', async () => {
    expect(await store.load()).toBe(true);

    expect(store.loaded()).toBe(true);
    expect(store.plans()).toEqual([basic]);
    expect(store.monitoredUnitCount()).toBe(12);
    expect(store.subscription()).toBeNull();
    expect(repository.listPayments).not.toHaveBeenCalled();
  });

  it('keeps the subscription the platform activated and its payments', async () => {
    await store.load();

    expect(await store.subscribe(subscribeCommand())).toBe(true);

    expect(repository.requestSubscription).toHaveBeenCalledWith(gallery, subscribeCommand());
    expect(store.subscription()?.isActive).toBe(true);
    expect(store.currentPlan()).toBe(basic);
    expect(store.payments()).toHaveLength(1);
  });

  it('shows the pending subscription and the rejected charge', async () => {
    await store.load();
    repository.requestSubscription.mockRejectedValue(
      new SubscriptionsError(SubscriptionsErrorCode.PaymentRejected),
    );
    repository.findSubscriptionByGallery.mockResolvedValue(
      subscription(SubscriptionStatus.PendingPayment),
    );
    repository.listPayments.mockResolvedValue([payment(PaymentStatus.Rejected)]);

    expect(await store.subscribe(subscribeCommand())).toBe(false);

    expect(store.error()).toBe(SubscriptionsErrorCode.PaymentRejected);
    expect(store.subscription()?.isActive).toBe(false);
    expect(store.payments()[0].isRejected).toBe(true);
  });

  it('does not call the platform when the plan does not cover the units', async () => {
    const small = new SubscriptionPlan('9', 'BASIC', 5, new Money(90), new Money(900), [], true);
    repository.listPlans.mockResolvedValue([small]);
    await store.load();

    expect(await store.subscribe(subscribeCommand(small.id))).toBe(false);
    expect(store.error()).toBe(SubscriptionsErrorCode.UnitLimitExceeded);
    expect(repository.requestSubscription).not.toHaveBeenCalled();
  });

  it('exposes the error code when the server cannot be reached', async () => {
    repository.listPlans.mockRejectedValue(new SubscriptionsError(SubscriptionsErrorCode.Network));

    expect(await store.load()).toBe(false);

    expect(store.error()).toBe(SubscriptionsErrorCode.Network);
    expect(store.loaded()).toBe(false);
  });
});
