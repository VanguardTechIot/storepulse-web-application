import { HttpClient, HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { retryOnDroppedConnection } from '../../../shared/infrastructure/retry-on-dropped-connection';
import { sendRequest } from '../../../shared/infrastructure/send-request';
import { Payment } from '../../domain/model/payment.entity';
import { PaymentStatus } from '../../domain/enums/payment-status.enum';
import { RegisterPaymentCommand } from '../../domain/model/register-payment.command';
import { Subscription } from '../../domain/model/subscription.entity';
import { SubscriptionPlan } from '../../domain/model/subscription-plan.entity';
import { SubscriptionsError, SubscriptionsErrorCode } from '../../domain/model/subscriptions-error';
import { SubscriptionsRepository } from '../../domain/repositories/subscriptions.repository';
import {
  PaymentAssembler,
  SubscriptionAssembler,
  SubscriptionPlanAssembler,
} from '../acl/subscriptions-assemblers';
import {
  PaymentResource,
  SubscriptionPlanResource,
  SubscriptionResource,
} from '../acl/subscriptions-responses';

const apiUrl = environment.platformProviderApiBaseUrl;
const plansUrl = `${apiUrl}${environment.platformProviderSubscriptionPlansEndpointPath}`;
const subscriptionsUrl = `${apiUrl}${environment.platformProviderSubscriptionsEndpointPath}`;
const paymentsUrl = `${apiUrl}${environment.platformProviderPaymentsEndpointPath}`;

// Test cards of the simulated gateway: one is rejected, the other leaves the gateway unreachable.
const REJECTED_CARD_ENDING = '0002';
const UNAVAILABLE_CARD_ENDING = '0119';
const GATEWAY_DELAY_MS = 900;

const unexpected = () => new SubscriptionsError(SubscriptionsErrorCode.Unexpected);

/**
 * HTTP implementation of the repository over the platform API (json-server locally and on the
 * hosted API). json-server only stores data, so the payment gateway answer is simulated here
 * before the payment is saved. When the REST API exists, only this class changes.
 */
export class HttpSubscriptionsRepository implements SubscriptionsRepository {
  private readonly http = inject(HttpClient);
  private readonly planAssembler = new SubscriptionPlanAssembler();
  private readonly subscriptionAssembler = new SubscriptionAssembler();
  private readonly paymentAssembler = new PaymentAssembler();

  async listPlans(): Promise<SubscriptionPlan[]> {
    const resources = await sendRequest(
      this.http.get<SubscriptionPlanResource[]>(plansUrl, { params: { published: true } }),
      unexpected,
    );
    return resources.map((r) => this.planAssembler.toEntityFromResource(r));
  }

  async findSubscriptionByGallery(galleryId: string): Promise<Subscription | null> {
    const resources = await sendRequest(
      this.http.get<SubscriptionResource[]>(subscriptionsUrl, { params: { galleryId } }),
      unexpected,
    );
    return resources.length > 0
      ? this.subscriptionAssembler.toEntityFromResource(resources[0])
      : null;
  }

  /** Updates the subscription, or creates it when the server does not know it yet. */
  async saveSubscription(subscription: Subscription): Promise<Subscription> {
    const resource = this.subscriptionAssembler.toResourceFromEntity(subscription);
    const url = `${subscriptionsUrl}/${encodeURIComponent(resource.id)}`;
    try {
      const saved = await firstValueFrom(
        this.http.put<SubscriptionResource>(url, resource).pipe(retryOnDroppedConnection()),
      );
      return this.subscriptionAssembler.toEntityFromResource(saved);
    } catch (error) {
      if (!(error instanceof HttpErrorResponse && error.status === HttpStatusCode.NotFound)) {
        throw unexpected();
      }
    }
    const created = await sendRequest(
      this.http.post<SubscriptionResource>(subscriptionsUrl, resource),
      unexpected,
    );
    return this.subscriptionAssembler.toEntityFromResource(created);
  }

  async listPayments(subscriptionId: string): Promise<Payment[]> {
    const resources = await sendRequest(
      this.http.get<PaymentResource[]>(paymentsUrl, {
        params: { subscriptionId, _sort: 'registeredAt', _order: 'desc' },
      }),
      unexpected,
    );
    return resources.map((r) => this.paymentAssembler.toEntityFromResource(r));
  }

  async registerPayment(command: RegisterPaymentCommand): Promise<Payment> {
    await new Promise((resolve) => setTimeout(resolve, GATEWAY_DELAY_MS));
    if (command.card.lastFourDigits === UNAVAILABLE_CARD_ENDING) {
      throw new SubscriptionsError(SubscriptionsErrorCode.GatewayUnavailable);
    }
    const accepted = command.card.lastFourDigits !== REJECTED_CARD_ENDING;
    const reference = Date.now().toString();
    const resource: PaymentResource = {
      id: crypto.randomUUID(),
      subscriptionId: command.subscriptionId,
      receiptNumber: accepted ? `F001-${reference.slice(-6)}` : null,
      planId: command.planId,
      billingCycle: command.billingCycle,
      amount: command.amount.amount,
      currency: command.amount.currency,
      method: command.method,
      methodLabel: command.card.label,
      status: accepted ? PaymentStatus.Accepted : PaymentStatus.Rejected,
      gatewayReference: `ch_sim_${reference}`,
      registeredAt: new Date().toISOString(),
    };
    const saved = await sendRequest(
      this.http.post<PaymentResource>(paymentsUrl, resource),
      unexpected,
    );
    return this.paymentAssembler.toEntityFromResource(saved);
  }
}
