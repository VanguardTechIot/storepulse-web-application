import { HttpClient, HttpStatusCode } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { ApiError } from '../../../shared/domain/model/api-error';
import { sendRequest } from '../../../shared/infrastructure/send-request';
import { GalleryReference } from '../../domain/model/gallery-reference';
import { Payment } from '../../domain/model/payment.entity';
import { RequestSubscriptionCommand } from '../../domain/model/request-subscription.command';
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

const codes = new Set<string>(Object.values(SubscriptionsErrorCode));

/** The platform answers the business error code in `message`. */
const failed = (error: ApiError) => {
  if (error.isNetworkFailure) return new SubscriptionsError(SubscriptionsErrorCode.Network);
  if (codes.has(error.message))
    return new SubscriptionsError(error.message as SubscriptionsErrorCode);
  return new SubscriptionsError(SubscriptionsErrorCode.Unexpected);
};

/** HTTP implementation of the repository over the REST API of Subscriptions and Payments. */
export class HttpSubscriptionsRepository implements SubscriptionsRepository {
  private readonly http = inject(HttpClient);
  private readonly planAssembler = new SubscriptionPlanAssembler();
  private readonly subscriptionAssembler = new SubscriptionAssembler();
  private readonly paymentAssembler = new PaymentAssembler();

  async listPlans(): Promise<SubscriptionPlan[]> {
    const resources = await sendRequest(
      this.http.get<SubscriptionPlanResource[]>(plansUrl),
      failed,
    );
    return resources.map((r) => this.planAssembler.toEntityFromResource(r));
  }

  async findSubscriptionByGallery(galleryId: string): Promise<Subscription | null> {
    try {
      const resource = await sendRequest(
        this.http.get<SubscriptionResource>(subscriptionsUrl, { params: { galleryId } }),
        (error) => error,
      );
      return this.subscriptionAssembler.toEntityFromResource(resource);
    } catch (error) {
      if ((error as ApiError).status === HttpStatusCode.NotFound) return null;
      throw failed(error as ApiError);
    }
  }

  async requestSubscription(
    gallery: GalleryReference,
    command: RequestSubscriptionCommand,
  ): Promise<Subscription> {
    const body = this.subscriptionAssembler.toRequestResource(gallery, command);
    const resource = await sendRequest(
      this.http.post<SubscriptionResource>(subscriptionsUrl, body),
      failed,
    );
    return this.subscriptionAssembler.toEntityFromResource(resource);
  }

  cancelRenewal(subscriptionId: string): Promise<Subscription> {
    return this.changeRenewal(subscriptionId, 'cancel-renewal');
  }

  reactivateRenewal(subscriptionId: string): Promise<Subscription> {
    return this.changeRenewal(subscriptionId, 'reactivate-renewal');
  }

  async listPayments(subscriptionId: string): Promise<Payment[]> {
    const url = `${subscriptionsUrl}/${encodeURIComponent(subscriptionId)}/payments`;
    const resources = await sendRequest(this.http.get<PaymentResource[]>(url), failed);
    return resources.map((r) => this.paymentAssembler.toEntityFromResource(r));
  }

  private async changeRenewal(subscriptionId: string, action: string): Promise<Subscription> {
    const url = `${subscriptionsUrl}/${encodeURIComponent(subscriptionId)}/${action}`;
    const resource = await sendRequest(this.http.post<SubscriptionResource>(url, null), failed);
    return this.subscriptionAssembler.toEntityFromResource(resource);
  }
}
