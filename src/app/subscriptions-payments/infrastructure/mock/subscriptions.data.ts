import { BillingCycle } from '../../domain/model/billing-cycle.enum';
import { PaymentMethod } from '../../domain/model/payment-method.enum';
import { PaymentStatus } from '../../domain/model/payment-status.enum';
import { SubscriptionStatus } from '../../domain/model/subscription-status.enum';
import {
  PaymentResource,
  SubscriptionPlanResource,
  SubscriptionResource,
} from '../subscriptions-responses';

/** In-memory data of Subscriptions and Payments (mock-ups 11 and 11a). */
export const SUBSCRIPTION_PLANS: SubscriptionPlanResource[] = [
  {
    id: 'pln-basic',
    code: 'BASIC',
    monitoredUnitLimit: 30,
    monthlyPrice: 290,
    annualPrice: 2900,
    currency: 'PEN',
    features: ['security_incidents', 'energy_submetering', 'notification_center'],
    published: true,
  },
  {
    id: 'pln-commercial',
    code: 'COMMERCIAL',
    monitoredUnitLimit: 100,
    monthlyPrice: 690,
    annualPrice: 6900,
    currency: 'PEN',
    features: ['everything_basic', 'water_telemetry', 'billing_per_unit', 'tenant_communication'],
    published: true,
  },
  {
    id: 'pln-corporate',
    code: 'CORPORATE',
    monitoredUnitLimit: null,
    monthlyPrice: 1490,
    annualPrice: 14900,
    currency: 'PEN',
    features: ['everything_commercial', 'multiple_galleries', 'advanced_reports'],
    published: true,
  },
];

/** Gallery `gal-001` of the local JSON API (server/db.json), administered by `usr-001`. */
export const SUBSCRIPTIONS: SubscriptionResource[] = [
  {
    id: 'sub-001',
    galleryId: 'gal-001',
    galleryAdministratorId: 'usr-001',
    planId: 'pln-commercial',
    status: SubscriptionStatus.Active,
    billingCycle: BillingCycle.Monthly,
    startDate: '2026-10-15T05:00:00Z',
    endDate: '2026-11-15T05:00:00Z',
    monitoredUnitCount: 12,
    autoRenewal: true,
    paymentMethodLabel: 'Visa •••• 4821',
  },
];

export const PAYMENTS: PaymentResource[] = [
  {
    id: 'pay-003',
    subscriptionId: 'sub-001',
    receiptNumber: 'F001-000318',
    planId: 'pln-commercial',
    billingCycle: BillingCycle.Monthly,
    amount: 690,
    currency: 'PEN',
    method: PaymentMethod.CreditCard,
    methodLabel: 'Visa •••• 4821',
    status: PaymentStatus.Accepted,
    gatewayReference: 'ch_3Q9x1aKZ0318',
    registeredAt: '2026-10-15T05:02:11Z',
  },
  {
    id: 'pay-002',
    subscriptionId: 'sub-001',
    receiptNumber: 'F001-000291',
    planId: 'pln-commercial',
    billingCycle: BillingCycle.Monthly,
    amount: 690,
    currency: 'PEN',
    method: PaymentMethod.CreditCard,
    methodLabel: 'Visa •••• 4821',
    status: PaymentStatus.Accepted,
    gatewayReference: 'ch_3Q2m7bKZ0291',
    registeredAt: '2026-09-15T05:01:47Z',
  },
  {
    id: 'pay-001',
    subscriptionId: 'sub-001',
    receiptNumber: null,
    planId: 'pln-commercial',
    billingCycle: BillingCycle.Monthly,
    amount: 690,
    currency: 'PEN',
    method: PaymentMethod.CreditCard,
    methodLabel: 'Visa •••• 0002',
    status: PaymentStatus.Rejected,
    gatewayReference: 'ch_3Pz4cKZ0277',
    registeredAt: '2026-09-15T05:00:58Z',
  },
];
