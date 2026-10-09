import { ConsumptionRegistration } from '../model/consumption-registration.entity';
import { Notification } from '../model/notification.entity';

/**
 * Access abstraction of Dashboard and Analytics. Mirrors TS-30 and TS-31: `/notifications` and the
 * consumption registrations that feed `/dashboard/{galleryId}/summary`.
 */
export interface AnalyticsRepository {
  /** Notifications of the signed-in user, as generated (not grouped). */
  listNotifications(): Promise<Notification[]>;
  saveNotifications(notifications: Notification[]): Promise<void>;
  listConsumptionRegistrations(): Promise<ConsumptionRegistration[]>;
}
