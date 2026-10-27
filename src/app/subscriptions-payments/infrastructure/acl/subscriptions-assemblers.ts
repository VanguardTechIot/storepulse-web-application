import { BaseAssembler } from '../../../shared/infrastructure/base-assembler';
import { BillingPeriod } from '../../domain/value-objects/billing-period.value-object';
import { Money } from '../../domain/value-objects/money.value-object';
import { Payment } from '../../domain/model/payment.entity';
import { Subscription } from '../../domain/model/subscription.entity';
import { SubscriptionPlan } from '../../domain/model/subscription-plan.entity';
import {
  PaymentResource,
  SubscriptionPlanResource,
  SubscriptionResource,
} from './subscriptions-responses';

// Plans are read-only and payments are built from the gateway answer: both only map inbound.
export class SubscriptionPlanAssembler {
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

export class PaymentAssembler {
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
}
