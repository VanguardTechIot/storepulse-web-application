import { BillingPeriod } from '../../domain/value-objects/billing-period.value-object';
import { GalleryReference } from '../../domain/model/gallery-reference';
import { Money } from '../../domain/value-objects/money.value-object';
import { Payment } from '../../domain/model/payment.entity';
import { RequestSubscriptionCommand } from '../../domain/model/request-subscription.command';
import { Subscription } from '../../domain/model/subscription.entity';
import { SubscriptionPlan } from '../../domain/model/subscription-plan.entity';
import {
  PaymentResource,
  RequestSubscriptionResource,
  SubscriptionPlanResource,
  SubscriptionResource,
} from './subscriptions-responses';

// The platform owns the state of the subscription: entities are only built from its answers.
export class SubscriptionPlanAssembler {
  toEntityFromResource(r: SubscriptionPlanResource): SubscriptionPlan {
    return new SubscriptionPlan(
      String(r.id),
      r.code,
      r.monitoredUnitLimit,
      new Money(r.monthlyPrice, r.currency),
      new Money(r.annualPrice, r.currency),
      r.features,
      r.published,
    );
  }
}

export class SubscriptionAssembler {
  toEntityFromResource(r: SubscriptionResource): Subscription {
    return Subscription.restore({
      id: String(r.id),
      galleryId: String(r.galleryId),
      galleryAdministratorId: String(r.galleryAdministratorId),
      planId: String(r.planId),
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

  toRequestResource(
    gallery: GalleryReference,
    command: RequestSubscriptionCommand,
  ): RequestSubscriptionResource {
    return {
      galleryId: Number(gallery.galleryId),
      monitoredUnitCount: gallery.monitoredUnitCount,
      planId: Number(command.planId),
      billingCycle: command.billingCycle,
      paymentMethod: command.paymentMethod,
      cardNumber: command.cardNumber.replace(/\s+/g, ''),
      cardExpiry: command.cardExpiry.trim(),
    };
  }
}

export class PaymentAssembler {
  toEntityFromResource(r: PaymentResource): Payment {
    return new Payment(
      String(r.id),
      String(r.subscriptionId),
      r.receiptNumber,
      String(r.planId),
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
