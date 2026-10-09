import { CommunicationAction } from './communication-action.enum';
import { NotificationChannel } from './notification-channel.enum';
import { ReferenceType } from './reference-type.enum';

/** Records a communication with a tenant for traceability. */
export class RegisterCommunicationLogCommand {
  readonly referenceId: string;
  readonly referenceType: ReferenceType;
  readonly action: CommunicationAction;
  readonly tenantId: string;
  readonly galleryAdministratorId: string;
  readonly channel: NotificationChannel;
  readonly detail: string;

  constructor(command: {
    referenceId: string;
    referenceType: ReferenceType;
    action: CommunicationAction;
    tenantId: string;
    galleryAdministratorId: string;
    channel: NotificationChannel;
    detail: string;
  }) {
    this.referenceId = command.referenceId;
    this.referenceType = command.referenceType;
    this.action = command.action;
    this.tenantId = command.tenantId;
    this.galleryAdministratorId = command.galleryAdministratorId;
    this.channel = command.channel;
    this.detail = command.detail;
  }
}
