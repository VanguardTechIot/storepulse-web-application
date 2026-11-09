import { CommercialGallery } from '../domain/model/commercial-gallery.entity';
import { CommercialUnit } from '../domain/model/commercial-unit.entity';
import { InvitationStatus } from '../domain/model/invitation-status.enum';
import { TenantInvitation } from '../domain/model/tenant-invitation.entity';
import { UnitStatus } from '../domain/model/unit-status.enum';
import { UnitType } from '../domain/model/unit-type.enum';
import {
  CommercialGalleryResource,
  CommercialUnitResource,
  RegisterCommercialUnitResource,
  SaveCommercialGalleryResource,
  TenantInvitationResource,
  UpdateCommercialUnitResource,
} from './property-management-responses';

export class CommercialGalleryAssembler {
  toEntityFromResource(r: CommercialGalleryResource): CommercialGallery {
    return new CommercialGallery({
      id: String(r.id),
      administratorId: String(r.administratorId),
      name: r.name,
      address: r.address,
      totalUnits: r.totalUnits,
      registeredAt: new Date(r.registeredAt),
    });
  }

  toRequestFromEntity(e: CommercialGallery): SaveCommercialGalleryResource {
    return { name: e.name, address: e.address, totalUnits: e.totalUnits };
  }
}

export class CommercialUnitAssembler {
  toEntityFromResource(r: CommercialUnitResource): CommercialUnit {
    return new CommercialUnit({
      id: String(r.id),
      galleryId: String(r.galleryId),
      type: r.type as UnitType,
      code: r.code,
      floor: r.floor,
      areaSquareMeters: r.areaSquareMeters,
      businessName: r.businessName,
      resourceId: r.resourceId === null ? null : String(r.resourceId),
      status: r.status as UnitStatus,
      active: r.active,
      createdAt: new Date(r.createdAt),
    });
  }

  toRegisterRequestFromEntity(e: CommercialUnit): RegisterCommercialUnitResource {
    return {
      type: e.type,
      code: e.code,
      floor: e.floor,
      areaSquareMeters: e.areaSquareMeters,
      businessName: e.businessName,
      resourceId: e.resourceId === null ? null : Number(e.resourceId),
    };
  }

  toUpdateRequestFromEntity(e: CommercialUnit): UpdateCommercialUnitResource {
    return {
      code: e.code,
      floor: e.floor,
      areaSquareMeters: e.areaSquareMeters,
      businessName: e.businessName,
      resourceId: e.resourceId === null ? null : Number(e.resourceId),
      status: e.status,
    };
  }
}

export class TenantInvitationAssembler {
  toEntityFromResource(r: TenantInvitationResource): TenantInvitation {
    return new TenantInvitation({
      id: String(r.id),
      unitId: String(r.unitId),
      galleryId: String(r.galleryId),
      email: r.email,
      token: r.token,
      status: r.status as InvitationStatus,
      sentAt: new Date(r.sentAt),
      expiresAt: new Date(r.expiresAt),
    });
  }
}
