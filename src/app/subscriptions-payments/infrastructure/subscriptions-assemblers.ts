import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { BillingPeriod } from '../domain/model/billing-period.value-object';
import { Money } from '../domain/model/money.value-object';
import { Payment } from '../domain/model/payment.entity';
import { Subscription } from '../domain/model/subscription.entity';
import { SubscriptionPlan } from '../domain/model/subscription-plan.entity';
import {
  PaymentResource,
  SubscriptionPlanResource,
  SubscriptionResource,
} from './subscriptions-responses';

export class SubscriptionPlanAssembler implements BaseAssembler<
  SubscriptionPlan,
  SubscriptionPlanResource
> {
  toEntityFromResource(r: SubscriptionPlanResource): SubscriptionPlan {
    return new SubscriptionPlan(
      r.id,
      r.code,
      r.monitoredUnitLimit,
      new Money(r.monthlyPrice, r.currency),
      new Money(r.annualPrice, r.currency),
      r.features,
      r.published,
    );
  }

  toResourceFromEntity(e: SubscriptionPlan): SubscriptionPlanResource {
    return {
      id: e.id,
      code: e.code,
      monitoredUnitLimit: e.monitoredUnitLimit,
      monthlyPrice: e.monthlyPrice.amount,
      annualPrice: e.annualPrice.amount,
      currency: e.monthlyPrice.currency,
      features: [...e.features],
      published: e.published,
    };
  }
}

export class SubscriptionAssembler implements BaseAssembler<Subscription, SubscriptionResource> {
  toEntityFromResource(r: SubscriptionResource): Subscription {
    return Subscription.restore({
      id: r.id,
      galleryId: r.galleryId,
      galleryAdministratorId: r.galleryAdministratorId,
      planId: r.planId,
      status: r.status,
      billingCycle: r.billingCycle,
      billingPeriod:
        r.startDate && r.endDate
          ? new BillingPeriod(new Date(r.startDate), new Date(r.endDate))
          : null,
      monitoredUnitCount: r.monitoredUnitCount,
      autoRenewal: r.autoRenewal,
      paymentMethodLabel: r.paymentMethodLabel,
    });
  }

  toResourceFromEntity(e: Subscription): SubscriptionResource {
    return {
      id: e.id,
      galleryId: e.galleryId,
      galleryAdministratorId: e.galleryAdministratorId,
      planId: e.planId,
      status: e.status,
      billingCycle: e.billingCycle,
      startDate: e.billingPeriod?.startDate.toISOString() ?? null,
      endDate: e.billingPeriod?.endDate.toISOString() ?? null,
      monitoredUnitCount: e.monitoredUnitCount,
      autoRenewal: e.autoRenewal,
      paymentMethodLabel: e.paymentMethodLabel,
    };
  }
}

export class PaymentAssembler implements BaseAssembler<Payment, PaymentResource> {
  toEntityFromResource(r: PaymentResource): Payment {
    return new Payment(
      r.id,
      r.subscriptionId,
      r.receiptNumber,
      r.planId,
      r.billingCycle,
      new Money(r.amount, r.currency),
      r.method,
      r.methodLabel,
      r.status,
      r.gatewayReference,
      new Date(r.registeredAt),
    );
  }

  toResourceFromEntity(e: Payment): PaymentResource {
    return {
      id: e.id,
      subscriptionId: e.subscriptionId,
      receiptNumber: e.receiptNumber,
      planId: e.planId,
      billingCycle: e.billingCycle,
      amount: e.amount.amount,
      currency: e.amount.currency,
      method: e.method,
      methodLabel: e.methodLabel,
      status: e.status,
      gatewayReference: e.gatewayReference,
      registeredAt: e.registeredAt.toISOString(),
    };
  }
}
