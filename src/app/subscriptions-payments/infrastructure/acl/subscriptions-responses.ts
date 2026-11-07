import { BillingCycle } from '../../domain/enums/billing-cycle.enum';
import { PaymentMethod } from '../../domain/enums/payment-method.enum';
import { PaymentStatus } from '../../domain/enums/payment-status.enum';
import { PlanCode } from '../../domain/model/subscription-plan.entity';
import { SubscriptionStatus } from '../../domain/enums/subscription-status.enum';

// The platform identifies every resource with a numeric id; the domain keeps them as text.

export interface SubscriptionPlanResource {
  id: number;
  code: PlanCode;
  monitoredUnitLimit: number | null;
  monthlyPrice: number;
  annualPrice: number;
  currency: string;
  features: string[];
  published: boolean;
}

export interface SubscriptionResource {
  id: number;
  galleryId: string | number;
  galleryAdministratorId: string | number;
  planId: number;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  startDate: string | null;
  endDate: string | null;
  monitoredUnitCount: number;
  autoRenewal: boolean;
  paymentMethodLabel: string | null;
}

/** Body of `POST /subscriptions`: the card goes to the gateway and is never stored. */
export interface RequestSubscriptionResource {
  galleryId: string;
  monitoredUnitCount: number;
  planId: string;
  billingCycle: BillingCycle;
  paymentMethod: PaymentMethod;
  cardNumber: string;
  cardExpiry: string;
}

export interface PaymentResource {
  id: number;
  subscriptionId: number;
  receiptNumber: string | null;
  planId: number;
  billingCycle: BillingCycle;
  amount: number;
  currency: string;
  method: PaymentMethod;
  methodLabel: string;
  status: PaymentStatus;
  gatewayReference: string | null;
  registeredAt: string;
}
