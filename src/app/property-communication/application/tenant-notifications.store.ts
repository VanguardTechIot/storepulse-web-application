import { computed, inject, Injectable, signal } from '@angular/core';
import { resolveAnnouncementRecipients } from '../domain/model/announcement-recipients';
import { CommunicationError, CommunicationErrorCode } from '../domain/model/communication-error';
import { NotificationStatus } from '../domain/model/notification-status.enum';
import { NotifyTenantCommand } from '../domain/model/notify-tenant.command';
import { PublishAnnouncementCommand } from '../domain/model/publish-announcement.command';
import { TenantNotification } from '../domain/model/tenant-notification.entity';
import { UnitReference } from '../domain/model/unit-reference';
import { PROPERTY_COMMUNICATION_REPOSITORY } from '../infrastructure/property-communication.token';
import { CommunicationDirectory } from './communication-directory';
import { runOperation } from './run-operation';

/** Outcome of the last publication, shown to the administrator. */
export interface PublicationResult {
  sent: number;
  /** Selected stores without a tenant, which nobody received. */
  unitsWithoutTenant: UnitReference[];
}

/**
 * Application service of the notifications sent to tenants: history, publication of
 * announcements and incident notices and delivery retries.
 */
@Injectable({ providedIn: 'root' })
export class TenantNotificationsStore {
  private readonly repository = inject(PROPERTY_COMMUNICATION_REPOSITORY);
  readonly directory = inject(CommunicationDirectory);

  private readonly notificationsState = signal<TenantNotification[]>([]);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<CommunicationErrorCode | null>(null);
  readonly lastPublication = signal<PublicationResult | null>(null);

  /** Newest first (GetNotificationsByTenantQuery, for every tenant of the gallery). */
  readonly notifications = computed(() =>
    [...this.notificationsState()].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
  );
  readonly failedCount = computed(
    () => this.notificationsState().filter((n) => n.status === NotificationStatus.Failed).length,
  );
  /** Notifications the tenants have not opened yet (GetUnreadNotificationsCountQuery). */
  readonly unreadCount = computed(() => this.notificationsState().filter((n) => !n.read).length);

  load(): Promise<boolean> {
    return runOperation(this.loading, this.error, async () => {
      const [, notifications] = await Promise.all([
        this.directory.load(),
        this.repository.listNotifications(),
      ]);
      this.notificationsState.set(notifications);
    });
  }

  /**
   * Sends the communication to every affected tenant at once. Fails with
   * `no_recipients` when none of the selected units has a tenant.
   */
  publish(command: PublishAnnouncementCommand): Promise<boolean> {
    return runOperation(this.saving, this.error, async () => {
      const administratorId = this.directory.requireAdministrator();
      const units = command.unitIds
        .map((unitId) => this.directory.unit(unitId))
        .filter((unit): unit is UnitReference => unit !== null);
      const assignments = await this.repository.listAssignments();
      const recipients = resolveAnnouncementRecipients(units, command.wholeGallery, assignments);
      if (recipients.assignments.length === 0) {
        throw new CommunicationError(CommunicationErrorCode.NoRecipients);
      }
      // Validates the texts before anything is sent.
      TenantNotification.create(this.notifyCommand(command, administratorId));
      const sent = await this.repository.publishAnnouncement(command);
      this.notificationsState.update((items) => [...sent, ...items]);
      this.lastPublication.set({
        sent: sent.length,
        unitsWithoutTenant: recipients.unitsWithoutTenant,
      });
    });
  }

  /** Delivers again a notification that failed. */
  retry(notificationId: string): Promise<boolean> {
    return runOperation(this.saving, this.error, async () => {
      const notification = this.notificationsState().find((n) => n.id === notificationId);
      if (!notification) throw new CommunicationError(CommunicationErrorCode.NotificationNotFound);
      notification.retry();
      const sent = await this.repository.retryNotification(notification.id);
      this.notificationsState.update((items) =>
        items.map((item) => (item.id === sent.id ? sent : item)),
      );
    });
  }

  clearError(): void {
    this.error.set(null);
  }

  private notifyCommand(
    command: PublishAnnouncementCommand,
    administratorId: string,
  ): NotifyTenantCommand {
    return new NotifyTenantCommand({
      tenantId: '',
      commercialUnitId: null,
      galleryAdministratorId: administratorId,
      type: command.type,
      title: command.title,
      body: command.body,
      channel: command.channel,
    });
  }
}
