import { CommercialGallery } from '../model/commercial-gallery.entity';
import { CommercialUnit } from '../model/commercial-unit.entity';
import { TenantInvitation } from '../model/tenant-invitation.entity';

/**
 * Access abstraction of the Property Management context. Mirrors TS-05 to TS-10:
 * `/galleries`, `/galleries/{id}/units`, `/units/{id}` and `/units/{id}/invite`.
 * Business errors are thrown as `PropertyError`.
 */
export interface PropertyManagementRepository {
  /** Gallery managed by the administrator, or `null` when it was not registered yet. */
  findGalleryByAdministrator(administratorId: string): Promise<CommercialGallery | null>;
  registerGallery(gallery: CommercialGallery): Promise<CommercialGallery>;
  updateGallery(gallery: CommercialGallery): Promise<CommercialGallery>;

  /** Every unit of the gallery, including the ones removed logically. */
  listUnits(galleryId: string): Promise<CommercialUnit[]>;
  getUnit(unitId: string): Promise<CommercialUnit>;
  registerUnit(unit: CommercialUnit): Promise<CommercialUnit>;
  /** Saves the whole unit: edition and status changes. */
  updateUnit(unit: CommercialUnit): Promise<CommercialUnit>;
  /** Logical removal: the unit is kept as inactive (TS-09). */
  removeUnit(unit: CommercialUnit): Promise<void>;

  listInvitations(galleryId: string): Promise<TenantInvitation[]>;
  sendInvitation(invitation: TenantInvitation): Promise<TenantInvitation>;
  updateInvitation(invitation: TenantInvitation): Promise<TenantInvitation>;
}
