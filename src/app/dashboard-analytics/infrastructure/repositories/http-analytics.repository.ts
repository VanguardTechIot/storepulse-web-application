import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { sendRequest } from '../../../shared/infrastructure/send-request';
import { AnalyticsError, AnalyticsErrorCode } from '../../domain/model/analytics-error';
import { ConsumptionRegistration } from '../../domain/model/consumption-registration.entity';
import { Notification } from '../../domain/model/notification.entity';
import { AnalyticsRepository } from '../../domain/repositories/analytics.repository';
import {
  ConsumptionRegistrationAssembler,
  NotificationAssembler,
} from '../acl/analytics-assemblers';
import { ConsumptionRegistrationResource, NotificationResource } from '../acl/analytics-responses';

const apiUrl = environment.platformProviderApiBaseUrl;
const notificationsUrl = `${apiUrl}${environment.platformProviderNotificationsEndpointPath}`;
const registrationsUrl = `${apiUrl}${environment.platformProviderConsumptionRegistrationsEndpointPath}`;

const unexpected = () => new AnalyticsError(AnalyticsErrorCode.Unexpected);

/**
 * HTTP implementation of the repository over the platform API (json-server locally and on the
 * hosted API). When the REST API exists, only this class changes.
 */
export class HttpAnalyticsRepository implements AnalyticsRepository {
  private readonly http = inject(HttpClient);
  private readonly notificationAssembler = new NotificationAssembler();
  private readonly registrationAssembler = new ConsumptionRegistrationAssembler();

  async listNotifications(): Promise<Notification[]> {
    const resources = await sendRequest(
      this.http.get<NotificationResource[]>(notificationsUrl),
      unexpected,
    );
    return resources.map((r) => this.notificationAssembler.toEntityFromResource(r));
  }

  /** One `PATCH` per notification, in sequence: json-server restarts after every write. */
  async saveNotifications(notifications: Notification[]): Promise<void> {
    for (const notification of notifications) {
      await sendRequest(
        this.http.patch(`${notificationsUrl}/${encodeURIComponent(notification.id)}`, {
          read: notification.read,
        }),
        () => new AnalyticsError(AnalyticsErrorCode.NotificationNotFound),
      );
    }
  }

  async listConsumptionRegistrations(): Promise<ConsumptionRegistration[]> {
    const resources = await sendRequest(
      this.http.get<ConsumptionRegistrationResource[]>(registrationsUrl),
      unexpected,
    );
    return resources.map((r) => this.registrationAssembler.toEntityFromResource(r));
  }
}
