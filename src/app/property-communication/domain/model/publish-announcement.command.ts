import { NotificationChannel } from './notification-channel.enum';
import { NotificationType } from './notification-type.enum';

/**
 * Publishes a communication of the administrator to the affected tenants (US-34, US-35): a
 * general announcement or the notice of an incident.
 */
export class PublishAnnouncementCommand {
  readonly type: NotificationType.Announcement | NotificationType.Incident;
  /** Stores or common areas it is about; ignored when `wholeGallery` is set. */
  readonly unitIds: readonly string[];
  readonly wholeGallery: boolean;
  readonly title: string;
  readonly body: string;
  readonly channel: NotificationChannel;

  constructor(command: {
    type: NotificationType.Announcement | NotificationType.Incident;
    unitIds: readonly string[];
    wholeGallery: boolean;
    title: string;
    body: string;
    channel: NotificationChannel;
  }) {
    this.type = command.type;
    this.unitIds = command.unitIds;
    this.wholeGallery = command.wholeGallery;
    this.title = command.title;
    this.body = command.body;
    this.channel = command.channel;
  }
}
