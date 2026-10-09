import { Payment } from '../../domain/model/payment.entity';
import { PaymentStatus } from '../../domain/model/payment-status.enum';
import { RegisterPaymentCommand } from '../../domain/model/register-payment.command';
import { Subscription } from '../../domain/model/subscription.entity';
import { SubscriptionPlan } from '../../domain/model/subscription-plan.entity';
import { SubscriptionsError, SubscriptionsErrorCode } from '../../domain/model/subscriptions-error';
import { SubscriptionsRepository } from '../../domain/repository/subscriptions.repository';
import {
  PaymentAssembler,
  SubscriptionAssembler,
  SubscriptionPlanAssembler,
} from '../subscriptions-assemblers';
import { PaymentResource, SubscriptionResource } from '../subscriptions-responses';
import { PAYMENTS, SUBSCRIPTION_PLANS, SUBSCRIPTIONS } from './subscriptions.data';

/** Test cards of the simulated gateway (US-44 scenario 2 and TS-27 scenario 3). */
const REJECTED_CARD_ENDING = '0002';
const UNAVAILABLE_CARD_ENDING = '0119';
/** Simulated latency of the gateway, so the checkout shows its processing state. */
const GATEWAY_DELAY_MS = 900;

/** In-memory implementation of the Subscriptions and Payments repository. */
export class MockSubscriptionsRepository implements SubscriptionsRepository {
  private readonly planAssembler = new SubscriptionPlanAssembler();
  private readonly subscriptionAssembler = new SubscriptionAssembler();
  private readonly paymentAssembler = new PaymentAssembler();

  private subscriptions: SubscriptionResource[] = structuredClone(SUBSCRIPTIONS);
  private payments: PaymentResource[] = structuredClone(PAYMENTS);

  async listPlans(): Promise<SubscriptionPlan[]> {
    return structuredClone(SUBSCRIPTION_PLANS)
      .filter((r) => r.published)
      .map((r) => this.planAssembler.toEntityFromResource(r));
  }

  async findSubscriptionByGallery(galleryId: string): Promise<Subscription | null> {
    const record = this.subscriptions.find((r) => r.galleryId === galleryId);
    return record ? this.subscriptionAssembler.toEntityFromResource(structuredClone(record)) : null;
  }

  async saveSubscription(subscription: Subscription): Promise<Subscription> {
    const record = this.subscriptionAssembler.toResourceFromEntity(subscription);
    const exists = this.subscriptions.some((r) => r.id === record.id);
    this.subscriptions = exists
      ? this.subscriptions.map((r) => (r.id === record.id ? record : r))
      : [...this.subscriptions, record];
    return this.subscriptionAssembler.toEntityFromResource(structuredClone(record));
  }

  async listPayments(subscriptionId: string): Promise<Payment[]> {
    return structuredClone(this.payments)
      .filter((r) => r.subscriptionId === subscriptionId)
      .sort((a, b) => b.registeredAt.localeCompare(a.registeredAt))
      .map((r) => this.paymentAssembler.toEntityFromResource(r));
  }

  async registerPayment(command: RegisterPaymentCommand): Promise<Payment> {
    await new Promise((resolve) => setTimeout(resolve, GATEWAY_DELAY_MS));
    if (command.card.lastFourDigits === UNAVAILABLE_CARD_ENDING) {
      throw new SubscriptionsError(SubscriptionsErrorCode.GatewayUnavailable);
    }
    const accepted = command.card.lastFourDigits !== REJECTED_CARD_ENDING;
    const sequence = this.payments.length + 1;
    const record: PaymentResource = {
      id: `pay-${String(sequence).padStart(3, '0')}`,
      subscriptionId: command.subscriptionId,
      receiptNumber: accepted ? `F001-${String(318 + sequence).padStart(6, '0')}` : null,
      planId: command.planId,
      billingCycle: command.billingCycle,
      amount: command.amount.amount,
      currency: command.amount.currency,
      method: command.method,
      methodLabel: command.card.label,
      status: accepted ? PaymentStatus.Accepted : PaymentStatus.Rejected,
      gatewayReference: `ch_mock_${Date.now()}`,
      registeredAt: new Date().toISOString(),
    };
    this.payments = [record, ...this.payments];
    return this.paymentAssembler.toEntityFromResource(structuredClone(record));
  }
}
