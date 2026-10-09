import { ConsumptionRegistration } from '../../domain/model/consumption-registration.entity';
import { Notification } from '../../domain/model/notification.entity';
import { AnalyticsRepository } from '../../domain/repository/analytics.repository';
import { ConsumptionRegistrationAssembler, NotificationAssembler } from '../analytics-assemblers';
import { NotificationResource } from '../analytics-responses';
import { CONSUMPTION_REGISTRATIONS, NOTIFICATIONS } from './analytics.data';

/** In-memory implementation of the Dashboard and Analytics repository. */
export class MockAnalyticsRepository implements AnalyticsRepository {
  private readonly notificationAssembler = new NotificationAssembler();
  private readonly registrationAssembler = new ConsumptionRegistrationAssembler();

  private notifications: NotificationResource[] = structuredClone(NOTIFICATIONS);

  async listNotifications(): Promise<Notification[]> {
    return structuredClone(this.notifications).map((r) =>
      this.notificationAssembler.toEntityFromResource(r),
    );
  }

  async saveNotifications(notifications: Notification[]): Promise<void> {
    const changed = new Map(
      notifications.map((n) => [n.id, this.notificationAssembler.toResourceFromEntity(n)]),
    );
    this.notifications = this.notifications.map((r) => changed.get(r.id) ?? r);
  }

  async listConsumptionRegistrations(): Promise<ConsumptionRegistration[]> {
    return structuredClone(CONSUMPTION_REGISTRATIONS).map((r) =>
      this.registrationAssembler.toEntityFromResource(r),
    );
  }
}
