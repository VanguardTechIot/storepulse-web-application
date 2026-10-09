/** Starts a conversation between a tenant and the gallery administrator. */
export class StartConversationCommand {
  readonly tenantId: string;
  readonly commercialUnitId: string | null;
  readonly galleryAdministratorId: string;
  readonly subject: string;

  constructor(command: {
    tenantId: string;
    commercialUnitId: string | null;
    galleryAdministratorId: string;
    subject: string;
  }) {
    this.tenantId = command.tenantId;
    this.commercialUnitId = command.commercialUnitId;
    this.galleryAdministratorId = command.galleryAdministratorId;
    this.subject = command.subject;
  }
}
