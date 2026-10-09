/** Invites a tenant to link to a store without a tenant (US-12, TS-10). */
export class InviteTenantCommand {
  readonly unitId: string;
  readonly email: string;

  constructor(command: { unitId: string; email: string }) {
    this.unitId = command.unitId;
    this.email = command.email;
  }
}
