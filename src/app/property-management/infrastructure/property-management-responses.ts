import { BaseResource } from '../../shared/infrastructure/base-response';

/** Commercial gallery, as `GET /galleries/{id}` returns it (TS-06). Dates are ISO-8601. */
export interface CommercialGalleryResource extends BaseResource {
  administratorId: string;
  name: string;
  address: string;
  totalUnits: number;
  registeredAt: string;
}

/** Unit of a gallery, as `GET /galleries/{id}/units` returns it (TS-07). */
export interface CommercialUnitResource extends BaseResource {
  galleryId: string;
  type: 'STORE' | 'COMMON_AREA';
  code: string;
  floor: string;
  areaSquareMeters: number;
  businessName: string | null;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
  active: boolean;
  createdAt: string;
}

/** Invitation created by `POST /units/{id}/invite` (TS-10). */
export interface TenantInvitationResource extends BaseResource {
  unitId: string;
  galleryId: string;
  email: string;
  token: string;
  status: 'PENDING' | 'ACCEPTED' | 'REVOKED';
  sentAt: string;
  expiresAt: string;
}
