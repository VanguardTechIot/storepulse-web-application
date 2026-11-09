import { CommercialGallery } from '../model/commercial-gallery.entity';
import { CommercialUnit } from '../model/commercial-unit.entity';
import { TenantInvitation } from '../model/tenant-invitation.entity';

/**
 * Access abstraction of the Property Management context. Mirrors `/galleries`,
 * `/galleries/{id}/units`, `/units/{id}`, `/units/{id}/invite` and `/tenant-invitations`, which
 * answer only what belongs to the signed-in administrator.
 * Business errors are thrown as `PropertyError`.
 */
export interface PropertyManagementRepository {
  /** Gallery of the signed-in administrator, or `null` when it was not registered yet. */
  findGallery(): Promise<CommercialGallery | null>;
  registerGallery(gallery: CommercialGallery): Promise<CommercialGallery>;
  updateGallery(gallery: CommercialGallery): Promise<CommercialGallery>;

  /** Every unit of the gallery, including the ones removed logically. */
  listUnits(galleryId: string): Promise<CommercialUnit[]>;
  getUnit(unitId: string): Promise<CommercialUnit>;
  registerUnit(unit: CommercialUnit): Promise<CommercialUnit>;
  /** Saves the edition and status changes of the unit. */
  updateUnit(unit: CommercialUnit): Promise<CommercialUnit>;
  /** Logical removal: the unit is kept as inactive. */
  removeUnit(unit: CommercialUnit): Promise<void>;

  /** Invitations of the gallery of the signed-in administrator. */
  listInvitations(): Promise<TenantInvitation[]>;
  /** Sends the invitation; any pending one of the same store is revoked. */
  sendInvitation(invitation: TenantInvitation): Promise<TenantInvitation>;
  revokeInvitation(invitationId: string): Promise<TenantInvitation>;
}
