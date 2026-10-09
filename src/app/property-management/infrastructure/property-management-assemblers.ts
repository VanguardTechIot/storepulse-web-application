import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { CommercialGallery } from '../domain/model/commercial-gallery.entity';
import { CommercialUnit } from '../domain/model/commercial-unit.entity';
import { InvitationStatus } from '../domain/model/invitation-status.enum';
import { TenantInvitation } from '../domain/model/tenant-invitation.entity';
import { UnitStatus } from '../domain/model/unit-status.enum';
import { UnitType } from '../domain/model/unit-type.enum';
import {
  CommercialGalleryResource,
  CommercialUnitResource,
  TenantInvitationResource,
} from './property-management-responses';

export class CommercialGalleryAssembler implements BaseAssembler<
  CommercialGallery,
  CommercialGalleryResource
> {
  toEntityFromResource(r: CommercialGalleryResource): CommercialGallery {
    return new CommercialGallery({
      id: r.id,
      administratorId: r.administratorId,
      name: r.name,
      address: r.address,
      totalUnits: r.totalUnits,
      registeredAt: new Date(r.registeredAt),
    });
  }

  toResourceFromEntity(e: CommercialGallery): CommercialGalleryResource {
    return {
      id: e.id,
      administratorId: e.administratorId,
      name: e.name,
      address: e.address,
      totalUnits: e.totalUnits,
      registeredAt: e.registeredAt.toISOString(),
    };
  }
}

export class CommercialUnitAssembler implements BaseAssembler<
  CommercialUnit,
  CommercialUnitResource
> {
  toEntityFromResource(r: CommercialUnitResource): CommercialUnit {
    return new CommercialUnit({
      id: r.id,
      galleryId: r.galleryId,
      type: r.type as UnitType,
      code: r.code,
      floor: r.floor,
      areaSquareMeters: r.areaSquareMeters,
      businessName: r.businessName,
      status: r.status as UnitStatus,
      active: r.active,
      createdAt: new Date(r.createdAt),
    });
  }

  toResourceFromEntity(e: CommercialUnit): CommercialUnitResource {
    return {
      id: e.id,
      galleryId: e.galleryId,
      type: e.type,
      code: e.code,
      floor: e.floor,
      areaSquareMeters: e.areaSquareMeters,
      businessName: e.businessName,
      status: e.status,
      active: e.active,
      createdAt: e.createdAt.toISOString(),
    };
  }
}

export class TenantInvitationAssembler implements BaseAssembler<
  TenantInvitation,
  TenantInvitationResource
> {
  toEntityFromResource(r: TenantInvitationResource): TenantInvitation {
    return new TenantInvitation({
      id: r.id,
      unitId: r.unitId,
      galleryId: r.galleryId,
      email: r.email,
      token: r.token,
      status: r.status as InvitationStatus,
      sentAt: new Date(r.sentAt),
      expiresAt: new Date(r.expiresAt),
    });
  }

  toResourceFromEntity(e: TenantInvitation): TenantInvitationResource {
    return {
      id: e.id,
      unitId: e.unitId,
      galleryId: e.galleryId,
      email: e.email,
      token: e.token,
      status: e.storedStatus as TenantInvitationResource['status'],
      sentAt: e.sentAt.toISOString(),
      expiresAt: e.expiresAt.toISOString(),
    };
  }
}
