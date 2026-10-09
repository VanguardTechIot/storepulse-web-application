import { BaseResource } from '../../shared/infrastructure/base-response';
import { BillingCycle } from '../domain/model/billing-cycle.enum';
import { PaymentMethod } from '../domain/model/payment-method.enum';
import { PaymentStatus } from '../domain/model/payment-status.enum';
import { PlanCode } from '../domain/model/subscription-plan.entity';
import { SubscriptionStatus } from '../domain/model/subscription-status.enum';

export interface SubscriptionPlanResource extends BaseResource {
  code: PlanCode;
  monitoredUnitLimit: number | null;
  monthlyPrice: number;
  annualPrice: number;
  currency: string;
  features: string[];
  published: boolean;
}

export interface SubscriptionResource extends BaseResource {
  galleryId: string;
  galleryAdministratorId: string;
  planId: string;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  startDate: string | null;
  endDate: string | null;
  monitoredUnitCount: number;
  autoRenewal: boolean;
  paymentMethodLabel: string | null;
}

export interface PaymentResource extends BaseResource {
  subscriptionId: string;
  receiptNumber: string | null;
  planId: string;
  billingCycle: BillingCycle;
  amount: number;
  currency: string;
  method: PaymentMethod;
  methodLabel: string;
  status: PaymentStatus;
  gatewayReference: string | null;
  registeredAt: string;
}
