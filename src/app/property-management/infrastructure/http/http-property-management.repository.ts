import { HttpClient, HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { retryOnDroppedConnection } from '../../../shared/infrastructure/retry-on-dropped-connection';
import { environment } from '../../../../environments/environment';
import { CommercialGallery } from '../../domain/model/commercial-gallery.entity';
import { CommercialUnit } from '../../domain/model/commercial-unit.entity';
import { PropertyError, PropertyErrorCode } from '../../domain/model/property-error';
import { TenantInvitation } from '../../domain/model/tenant-invitation.entity';
import { UnitType } from '../../domain/model/unit-type.enum';
import { PropertyManagementRepository } from '../../domain/repository/property-management.repository';
import {
  CommercialGalleryAssembler,
  CommercialUnitAssembler,
  TenantInvitationAssembler,
} from '../property-management-assemblers';
import {
  CommercialGalleryResource,
  CommercialUnitResource,
  TenantInvitationResource,
} from '../property-management-responses';

const apiUrl = environment.platformProviderApiBaseUrl;
const galleriesUrl = `${apiUrl}${environment.platformProviderGalleriesEndpointPath}`;
const unitsUrl = `${apiUrl}${environment.platformProviderUnitsEndpointPath}`;
const invitationsUrl = `${apiUrl}${environment.platformProviderTenantInvitationsEndpointPath}`;

function galleryUnitsUrl(galleryId: string): string {
  const path = environment.platformProviderGalleryUnitsEndpointPath;
  return `${apiUrl}${path.replace('{galleryId}', encodeURIComponent(galleryId))}`;
}

function unitInviteUrl(unitId: string): string {
  const path = environment.platformProviderUnitInviteEndpointPath;
  return `${apiUrl}${path.replace('{unitId}', encodeURIComponent(unitId))}`;
}

/** New resources are sent without id: the server assigns it. */
function withoutId<T extends { id: string }>(resource: T): Omit<T, 'id'> {
  const { id: _id, ...rest } = resource;
  return rest;
}

/**
 * HTTP implementation of the repository over the local data server (json-server).
 *
 * json-server only stores data, so the duplicated unit check (409, TS-07 and TS-08) is done by the
 * domain before saving, and the logical removal is sent as a `PATCH` (a `DELETE` would erase the
 * row). When the REST API exists, only this class changes.
 */
export class HttpPropertyManagementRepository implements PropertyManagementRepository {
  private readonly http = inject(HttpClient);
  private readonly galleryAssembler = new CommercialGalleryAssembler();
  private readonly unitAssembler = new CommercialUnitAssembler();
  private readonly invitationAssembler = new TenantInvitationAssembler();

  async findGalleryByAdministrator(administratorId: string): Promise<CommercialGallery | null> {
    try {
      const galleries = await firstValueFrom(
        this.http
          .get<CommercialGalleryResource[]>(galleriesUrl, { params: { administratorId } })
          .pipe(retryOnDroppedConnection()),
      );
      return galleries.length > 0 ? this.galleryAssembler.toEntityFromResource(galleries[0]) : null;
    } catch (error) {
      throw this.translate(error, PropertyErrorCode.GalleryNotFound);
    }
  }

  async registerGallery(gallery: CommercialGallery): Promise<CommercialGallery> {
    try {
      const saved = await firstValueFrom(
        this.http
          .post<CommercialGalleryResource>(
            galleriesUrl,
            withoutId(this.galleryAssembler.toResourceFromEntity(gallery)),
          )
          .pipe(retryOnDroppedConnection()),
      );
      return this.galleryAssembler.toEntityFromResource(saved);
    } catch (error) {
      throw this.translate(error, PropertyErrorCode.GalleryNotFound);
    }
  }

  async updateGallery(gallery: CommercialGallery): Promise<CommercialGallery> {
    try {
      const saved = await firstValueFrom(
        this.http
          .put<CommercialGalleryResource>(
            `${galleriesUrl}/${encodeURIComponent(gallery.id)}`,
            this.galleryAssembler.toResourceFromEntity(gallery),
          )
          .pipe(retryOnDroppedConnection()),
      );
      return this.galleryAssembler.toEntityFromResource(saved);
    } catch (error) {
      throw this.translate(error, PropertyErrorCode.GalleryNotFound);
    }
  }

  async listUnits(galleryId: string): Promise<CommercialUnit[]> {
    try {
      const units = await firstValueFrom(
        this.http
          .get<CommercialUnitResource[]>(galleryUnitsUrl(galleryId))
          .pipe(retryOnDroppedConnection()),
      );
      return units.map((unit) => this.unitAssembler.toEntityFromResource(unit));
    } catch (error) {
      throw this.translate(error, PropertyErrorCode.GalleryNotFound);
    }
  }

  async getUnit(unitId: string): Promise<CommercialUnit> {
    try {
      const unit = await firstValueFrom(
        this.http
          .get<CommercialUnitResource>(`${unitsUrl}/${encodeURIComponent(unitId)}`)
          .pipe(retryOnDroppedConnection()),
      );
      return this.unitAssembler.toEntityFromResource(unit);
    } catch (error) {
      throw this.translate(error, PropertyErrorCode.UnitNotFound);
    }
  }

  async registerUnit(unit: CommercialUnit): Promise<CommercialUnit> {
    try {
      const saved = await firstValueFrom(
        this.http
          .post<CommercialUnitResource>(
            galleryUnitsUrl(unit.galleryId),
            withoutId(this.unitAssembler.toResourceFromEntity(unit)),
          )
          .pipe(retryOnDroppedConnection()),
      );
      return this.unitAssembler.toEntityFromResource(saved);
    } catch (error) {
      throw this.translate(error, PropertyErrorCode.GalleryNotFound, unit.type);
    }
  }

  async updateUnit(unit: CommercialUnit): Promise<CommercialUnit> {
    try {
      const saved = await firstValueFrom(
        this.http
          .patch<CommercialUnitResource>(
            `${unitsUrl}/${encodeURIComponent(unit.id)}`,
            this.unitAssembler.toResourceFromEntity(unit),
          )
          .pipe(retryOnDroppedConnection()),
      );
      return this.unitAssembler.toEntityFromResource(saved);
    } catch (error) {
      throw this.translate(error, PropertyErrorCode.UnitNotFound, unit.type);
    }
  }

  async removeUnit(unit: CommercialUnit): Promise<void> {
    try {
      await firstValueFrom(
        this.http
          .patch(`${unitsUrl}/${encodeURIComponent(unit.id)}`, { active: false })
          .pipe(retryOnDroppedConnection()),
      );
    } catch (error) {
      throw this.translate(error, PropertyErrorCode.UnitNotFound);
    }
  }

  async listInvitations(galleryId: string): Promise<TenantInvitation[]> {
    try {
      const invitations = await firstValueFrom(
        this.http
          .get<TenantInvitationResource[]>(invitationsUrl, { params: { galleryId } })
          .pipe(retryOnDroppedConnection()),
      );
      return invitations.map((invitation) =>
        this.invitationAssembler.toEntityFromResource(invitation),
      );
    } catch (error) {
      throw this.translate(error, PropertyErrorCode.GalleryNotFound);
    }
  }

  async sendInvitation(invitation: TenantInvitation): Promise<TenantInvitation> {
    try {
      const saved = await firstValueFrom(
        this.http
          .post<TenantInvitationResource>(
            unitInviteUrl(invitation.unitId),
            withoutId(this.invitationAssembler.toResourceFromEntity(invitation)),
          )
          .pipe(retryOnDroppedConnection()),
      );
      return this.invitationAssembler.toEntityFromResource(saved);
    } catch (error) {
      throw this.translate(error, PropertyErrorCode.UnitNotFound);
    }
  }

  async updateInvitation(invitation: TenantInvitation): Promise<TenantInvitation> {
    try {
      const saved = await firstValueFrom(
        this.http
          .patch<TenantInvitationResource>(
            `${invitationsUrl}/${encodeURIComponent(invitation.id)}`,
            this.invitationAssembler.toResourceFromEntity(invitation),
          )
          .pipe(retryOnDroppedConnection()),
      );
      return this.invitationAssembler.toEntityFromResource(saved);
    } catch (error) {
      throw this.translate(error, PropertyErrorCode.UnitNotFound);
    }
  }

  /** Maps the TS-05 to TS-10 status codes to business errors; anything else stays unexpected. */
  private translate(error: unknown, notFound: PropertyErrorCode, type?: UnitType): unknown {
    if (!(error instanceof HttpErrorResponse)) return error;
    switch (error.status) {
      case HttpStatusCode.NotFound:
        return new PropertyError(notFound);
      case HttpStatusCode.Conflict:
        return new PropertyError(
          type === UnitType.CommonArea
            ? PropertyErrorCode.DuplicatedCommonAreaName
            : PropertyErrorCode.DuplicatedUnitCode,
        );
      default:
        return error;
    }
  }
}
