import { computed, inject, Injectable, signal, WritableSignal } from '@angular/core';
import { CommercialGallery } from '../domain/model/commercial-gallery.entity';
import { CommercialUnit } from '../domain/model/commercial-unit.entity';
import { InvitationStatus } from '../domain/model/invitation-status.enum';
import { InviteTenantCommand } from '../domain/model/invite-tenant.command';
import { PropertyError, PropertyErrorCode } from '../domain/model/property-error';
import { RegisterCommercialGalleryCommand } from '../domain/model/register-commercial-gallery.command';
import { RegisterCommercialUnitCommand } from '../domain/model/register-commercial-unit.command';
import { TenantInvitation } from '../domain/model/tenant-invitation.entity';
import { UnitStatus } from '../domain/model/unit-status.enum';
import { UnitTenant } from '../domain/model/unit-tenant';
import { UpdateCommercialGalleryInfoCommand } from '../domain/model/update-commercial-gallery-info.command';
import { UpdateCommercialUnitCommand } from '../domain/model/update-commercial-unit.command';
import { CommunicationContextFacade } from '../infrastructure/acl/communication-context-facade';
import { IamContextFacade } from '../infrastructure/acl/iam-context-facade';
import { ResourceAssetContextFacade } from '../infrastructure/acl/resource-asset-context-facade';
import { PROPERTY_MANAGEMENT_REPOSITORY } from '../infrastructure/property-management.token';

/** Counters of the gallery summary (US-13). */
export interface GallerySummary {
  stores: number;
  commonAreas: number;
  occupied: number;
  available: number;
  maintenance: number;
}

/**
 * Application service of Property Management: coordinates the use cases of the gallery, its units
 * and the tenant invitations, and keeps their state.
 *
 * Each operation resolves to `true` when it succeeds. On failure it resolves to `false` and
 * exposes the reason in `error` (a `PropertyErrorCode`, translated as `property.errors.<code>`).
 */
@Injectable({ providedIn: 'root' })
export class PropertyManagementStore {
  private readonly repository = inject(PROPERTY_MANAGEMENT_REPOSITORY);
  private readonly iamContext = inject(IamContextFacade);
  private readonly resourceAssetContext = inject(ResourceAssetContextFacade);
  private readonly communicationContext = inject(CommunicationContextFacade);

  private readonly galleryState = signal<CommercialGallery | null>(null);
  private readonly unitsState = signal<CommercialUnit[]>([]);
  private readonly invitationsState = signal<TenantInvitation[]>([]);
  private readonly tenantsState = signal<Map<string, UnitTenant>>(new Map());
  private readonly loadedFor = signal<string | null>(null);

  readonly gallery = this.galleryState.asReadonly();
  readonly invitations = this.invitationsState.asReadonly();
  readonly assignmentsRoute = this.communicationContext.assignmentsRoute;
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<PropertyErrorCode | null>(null);
  /** Values for the error message, such as the devices that block a removal. */
  readonly errorDetails = signal<Record<string, string | number>>({});

  /** `true` once the gallery of the signed-in administrator was looked up. */
  readonly loaded = computed(
    () =>
      this.loadedFor() !== null && this.loadedFor() === this.iamContext.currentAdministratorId(),
  );

  /** Units still managed (not removed), sorted by floor and number. */
  readonly units = computed(() =>
    this.unitsState()
      .filter((unit) => unit.active)
      .sort(
        (a, b) =>
          a.floor.localeCompare(b.floor, undefined, { numeric: true }) ||
          a.code.localeCompare(b.code, undefined, { numeric: true }),
      ),
  );

  readonly summary = computed<GallerySummary>(() => {
    const units = this.units();
    const stores = units.filter((unit) => unit.isStore);
    return {
      stores: stores.length,
      commonAreas: units.length - stores.length,
      occupied: stores.filter((unit) => unit.status === UnitStatus.Occupied).length,
      available: stores.filter((unit) => unit.status === UnitStatus.Available).length,
      maintenance: units.filter((unit) => unit.status === UnitStatus.Maintenance).length,
    };
  });

  /** Distinct floors, in building order, for the floor layout. */
  readonly floors = computed(() => [...new Set(this.units().map((unit) => unit.floor))]);

  /** Invitations, newest first. */
  readonly sortedInvitations = computed(() =>
    [...this.invitationsState()].sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime()),
  );

  unitById(unitId: string): CommercialUnit | null {
    return this.unitsState().find((unit) => unit.id === unitId) ?? null;
  }

  tenantOf(unitId: string): UnitTenant | null {
    return this.tenantsState().get(unitId) ?? null;
  }

  /** Latest invitation of the unit still waiting to be accepted, expired or not. */
  pendingInvitationOf(unitId: string): TenantInvitation | null {
    return (
      this.sortedInvitations().find(
        (invitation) => invitation.unitId === unitId && invitation.canBeResent(),
      ) ?? null
    );
  }

  invitationsOf(unitId: string): TenantInvitation[] {
    return this.sortedInvitations().filter((invitation) => invitation.unitId === unitId);
  }

  /** Gallery, units, invitations and tenants of the signed-in administrator (US-13). */
  load(): Promise<boolean> {
    return this.execute(this.loading, async () => {
      const administratorId = this.requireAdministrator();
      if (this.loadedFor() !== administratorId) this.reset();
      const gallery = await this.repository.findGalleryByAdministrator(administratorId);
      this.galleryState.set(gallery);
      if (gallery) await this.loadGalleryContent(gallery, administratorId);
      this.loadedFor.set(administratorId);
    });
  }

  registerGallery(command: RegisterCommercialGalleryCommand): Promise<boolean> {
    return this.execute(this.saving, async () => {
      const administratorId = this.requireAdministrator();
      if (await this.repository.findGalleryByAdministrator(administratorId)) {
        throw new PropertyError(PropertyErrorCode.GalleryAlreadyRegistered);
      }
      const gallery = CommercialGallery.register(administratorId, command);
      this.galleryState.set(await this.repository.registerGallery(gallery));
      this.unitsState.set([]);
      this.invitationsState.set([]);
      this.loadedFor.set(administratorId);
    });
  }

  updateGallery(command: UpdateCommercialGalleryInfoCommand): Promise<boolean> {
    return this.execute(this.saving, async () => {
      const gallery = this.requireGallery().updateInfo(command);
      this.galleryState.set(await this.repository.updateGallery(gallery));
    });
  }

  /** Registers a store (US-09) or a common area (US-57). */
  registerUnit(command: RegisterCommercialUnitCommand): Promise<boolean> {
    return this.execute(this.saving, async () => {
      const gallery = this.requireGallery();
      const unit = CommercialUnit.register(gallery.id, command, this.unitsState());
      const saved = await this.repository.registerUnit(unit);
      this.unitsState.update((units) => [...units, saved]);
    });
  }

  updateUnit(unitId: string, command: UpdateCommercialUnitCommand): Promise<boolean> {
    return this.execute(this.saving, async () => {
      const unit = this.requireUnit(unitId).update(command, this.unitsState());
      this.replaceUnit(await this.repository.updateUnit(unit));
    });
  }

  markUnderMaintenance(unitId: string): Promise<boolean> {
    return this.execute(this.saving, async () => {
      const unit = this.requireUnit(unitId).markUnderMaintenance();
      this.replaceUnit(await this.repository.updateUnit(unit));
    });
  }

  endMaintenance(unitId: string): Promise<boolean> {
    return this.execute(this.saving, async () => {
      const unit = this.requireUnit(unitId).endMaintenance();
      this.replaceUnit(await this.repository.updateUnit(unit));
    });
  }

  /** Logical removal, refused while devices are linked or a tenant occupies it (US-11). */
  removeUnit(unitId: string): Promise<boolean> {
    return this.execute(this.saving, async () => {
      const current = this.requireUnit(unitId);
      const devices = await this.resourceAssetContext.linkedDeviceSerials(current);
      const removed = current.remove(devices);
      await this.repository.removeUnit(removed);
      this.replaceUnit(removed);
    });
  }

  /** Serial numbers of the IoT devices installed in the unit. */
  linkedDevicesOf(unitId: string): Promise<string[]> {
    const unit = this.unitById(unitId);
    return unit ? this.resourceAssetContext.linkedDeviceSerials(unit) : Promise.resolve([]);
  }

  /**
   * Sends a sign-up link valid for 7 days to the tenant of a store without tenant (US-12). Any
   * link still pending for the store is invalidated first (scenario 3).
   */
  inviteTenant(command: InviteTenantCommand): Promise<boolean> {
    return this.execute(this.saving, async () => {
      const unit = this.requireUnit(command.unitId);
      const invitation = TenantInvitation.issue(unit, command.email);
      await this.revokePendingInvitations(unit.id);
      const sent = await this.repository.sendInvitation(invitation);
      this.invitationsState.update((invitations) => [...invitations, sent]);
      this.deliver(unit, sent);
    });
  }

  /** Sends a new link to the same email and invalidates the previous one (US-12, scenario 3). */
  resendInvitation(invitationId: string): Promise<boolean> {
    const invitation = this.invitationsState().find((item) => item.id === invitationId);
    if (!invitation || !invitation.canBeResent()) {
      this.error.set(PropertyErrorCode.InvitationNotPending);
      return Promise.resolve(false);
    }
    return this.inviteTenant(
      new InviteTenantCommand({ unitId: invitation.unitId, email: invitation.email }),
    );
  }

  /** Cancels a link that was not used yet. */
  revokeInvitation(invitationId: string): Promise<boolean> {
    return this.execute(this.saving, async () => {
      const invitation = this.invitationsState().find((item) => item.id === invitationId);
      if (!invitation) throw new PropertyError(PropertyErrorCode.InvitationNotPending);
      this.replaceInvitation(await this.repository.updateInvitation(invitation.revoke()));
    });
  }

  clearError(): void {
    this.error.set(null);
    this.errorDetails.set({});
  }

  private async loadGalleryContent(gallery: CommercialGallery, administratorId: string) {
    const [units, invitations, tenants] = await Promise.all([
      this.repository.listUnits(gallery.id),
      this.repository.listInvitations(gallery.id),
      // The gallery is still usable when the tenants cannot be read.
      this.communicationContext
        .tenantsByUnit(administratorId)
        .catch(() => new Map<string, UnitTenant>()),
    ]);
    this.unitsState.set(units);
    this.invitationsState.set(invitations);
    this.tenantsState.set(tenants);
  }

  private async revokePendingInvitations(unitId: string): Promise<void> {
    const pending = this.invitationsState().filter(
      (invitation) => invitation.unitId === unitId && invitation.canBeResent(),
    );
    for (const invitation of pending) {
      this.replaceInvitation(await this.repository.updateInvitation(invitation.revoke()));
    }
  }

  /**
   * There is no email service in local development: the sign-up link is printed in the console,
   * like the password reset code of Identity and Access Management.
   */
  private deliver(unit: CommercialUnit, invitation: TenantInvitation): void {
    const link = `${location.origin}/iam/sign-up?invitation=${invitation.token}`;
    console.info(
      `[Property] Invitation for ${unit.code} sent to ${invitation.email}: ${link} ` +
        `(valid until ${invitation.expiresAt.toISOString()})`,
    );
  }

  private replaceUnit(unit: CommercialUnit): void {
    this.unitsState.update((units) => units.map((item) => (item.id === unit.id ? unit : item)));
  }

  private replaceInvitation(invitation: TenantInvitation): void {
    this.invitationsState.update((invitations) =>
      invitations.map((item) => (item.id === invitation.id ? invitation : item)),
    );
  }

  private reset(): void {
    this.galleryState.set(null);
    this.unitsState.set([]);
    this.invitationsState.set([]);
    this.tenantsState.set(new Map());
    this.loadedFor.set(null);
  }

  private requireAdministrator(): string {
    const administratorId = this.iamContext.currentAdministratorId();
    if (!administratorId) throw new PropertyError(PropertyErrorCode.GalleryNotFound);
    return administratorId;
  }

  private requireGallery(): CommercialGallery {
    const gallery = this.galleryState();
    if (!gallery) throw new PropertyError(PropertyErrorCode.GalleryNotFound);
    return gallery;
  }

  private requireUnit(unitId: string): CommercialUnit {
    const unit = this.unitById(unitId);
    if (!unit || !unit.active) throw new PropertyError(PropertyErrorCode.UnitNotFound);
    return unit;
  }

  private async execute(
    busy: WritableSignal<boolean>,
    operation: () => Promise<void>,
  ): Promise<boolean> {
    busy.set(true);
    this.clearError();
    try {
      await operation();
      return true;
    } catch (error) {
      if (!(error instanceof PropertyError)) console.error('[Property]', error);
      this.error.set(error instanceof PropertyError ? error.code : PropertyErrorCode.Unexpected);
      this.errorDetails.set(error instanceof PropertyError ? error.details : {});
      return false;
    } finally {
      busy.set(false);
    }
  }
}
