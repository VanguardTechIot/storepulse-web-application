/** Commercial gallery, as `GET /galleries/{id}` returns it. Dates are ISO-8601. */
export interface CommercialGalleryResource {
  id: number;
  administratorId: number;
  name: string;
  address: string;
  totalUnits: number;
  registeredAt: string;
}

/** Body of `POST /galleries` and `PUT /galleries/{id}`. */
export type SaveCommercialGalleryResource = Pick<
  CommercialGalleryResource,
  'name' | 'address' | 'totalUnits'
>;

/** Unit of a gallery, as `GET /galleries/{id}/units` returns it. */
export interface CommercialUnitResource {
  id: number;
  galleryId: number;
  type: 'STORE' | 'COMMON_AREA';
  code: string;
  floor: string;
  areaSquareMeters: number;
  businessName: string | null;
  /** Monitored resource whose consumption is billed to the unit. */
  resourceId: number | null;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
  active: boolean;
  createdAt: string;
}

/** Body of `POST /galleries/{id}/units`. */
export type RegisterCommercialUnitResource = Pick<
  CommercialUnitResource,
  'type' | 'code' | 'floor' | 'areaSquareMeters' | 'businessName' | 'resourceId'
>;

/** Body of `PATCH /units/{id}`: only the fields sent change; `active: false` removes the unit. */
export type UpdateCommercialUnitResource = Partial<
  Pick<
    CommercialUnitResource,
    'code' | 'floor' | 'areaSquareMeters' | 'businessName' | 'resourceId' | 'status' | 'active'
  >
>;

/** Invitation created by `POST /units/{id}/invite`. */
export interface TenantInvitationResource {
  id: number;
  unitId: number;
  galleryId: number;
  email: string;
  token: string;
  status: 'PENDING' | 'ACCEPTED' | 'REVOKED';
  sentAt: string;
  expiresAt: string;
}

/** Body of `POST /units/{id}/invite`. */
export interface InviteTenantResource {
  email: string;
}
