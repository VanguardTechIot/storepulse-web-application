/** Assigns a registered tenant to a free store of the gallery. */
export class AssignTenantCommand {
  readonly tenantId: string;
  readonly commercialUnitId: string;
  readonly galleryAdministratorId: string;

  constructor(command: {
    tenantId: string;
    commercialUnitId: string;
    galleryAdministratorId: string;
  }) {
    this.tenantId = command.tenantId;
    this.commercialUnitId = command.commercialUnitId;
    this.galleryAdministratorId = command.galleryAdministratorId;
  }
}
