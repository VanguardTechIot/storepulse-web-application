import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { ApiError } from '../../../shared/domain/model/api-error';
import { sendRequest } from '../../../shared/infrastructure/send-request';
import { CommercialGallery } from '../../domain/model/commercial-gallery.entity';
import { CommercialUnit } from '../../domain/model/commercial-unit.entity';
import { PropertyError, PropertyErrorCode } from '../../domain/model/property-error';
import { TenantInvitation } from '../../domain/model/tenant-invitation.entity';
import { PropertyManagementRepository } from '../../domain/repository/property-management.repository';
import {
  CommercialGalleryAssembler,
  CommercialUnitAssembler,
  TenantInvitationAssembler,
} from '../property-management-assemblers';
import {
  CommercialGalleryResource,
  CommercialUnitResource,
  InviteTenantResource,
  TenantInvitationResource,
} from '../property-management-responses';

const apiUrl = environment.platformProviderApiBaseUrl;
const galleriesUrl = `${apiUrl}${environment.platformProviderGalleriesEndpointPath}`;
const unitsUrl = `${apiUrl}${environment.platformProviderUnitsEndpointPath}`;
const invitationsUrl = `${apiUrl}${environment.platformProviderTenantInvitationsEndpointPath}`;

const codes = new Set<string>(Object.values(PropertyErrorCode));

/** The REST API answers the business code in `message`; anything else stays unexpected. */
const failed = (error: ApiError) =>
  new PropertyError(
    codes.has(error.message) ? (error.message as PropertyErrorCode) : PropertyErrorCode.Unexpected,
  );

function galleryUnitsUrl(galleryId: string): string {
  const path = environment.platformProviderGalleryUnitsEndpointPath;
  return `${apiUrl}${path.replace('{galleryId}', encodeURIComponent(galleryId))}`;
}

function unitInviteUrl(unitId: string): string {
  const path = environment.platformProviderUnitInviteEndpointPath;
  return `${apiUrl}${path.replace('{unitId}', encodeURIComponent(unitId))}`;
}

/**
 * HTTP implementation of the repository over the StorePulse REST API. The API answers only the
 * gallery, units and invitations of the signed-in administrator.
 */
export class HttpPropertyManagementRepository implements PropertyManagementRepository {
  private readonly http = inject(HttpClient);
  private readonly galleryAssembler = new CommercialGalleryAssembler();
  private readonly unitAssembler = new CommercialUnitAssembler();
  private readonly invitationAssembler = new TenantInvitationAssembler();

  async findGallery(): Promise<CommercialGallery | null> {
    const galleries = await sendRequest(
      this.http.get<CommercialGalleryResource[]>(galleriesUrl),
      failed,
    );
    return galleries.length > 0 ? this.galleryAssembler.toEntityFromResource(galleries[0]) : null;
  }

  async registerGallery(gallery: CommercialGallery): Promise<CommercialGallery> {
    const resource = await sendRequest(
      this.http.post<CommercialGalleryResource>(
        galleriesUrl,
        this.galleryAssembler.toRequestFromEntity(gallery),
      ),
      failed,
    );
    return this.galleryAssembler.toEntityFromResource(resource);
  }

  async updateGallery(gallery: CommercialGallery): Promise<CommercialGallery> {
    const resource = await sendRequest(
      this.http.put<CommercialGalleryResource>(
        `${galleriesUrl}/${encodeURIComponent(gallery.id)}`,
        this.galleryAssembler.toRequestFromEntity(gallery),
      ),
      failed,
    );
    return this.galleryAssembler.toEntityFromResource(resource);
  }

  async listUnits(galleryId: string): Promise<CommercialUnit[]> {
    const resources = await sendRequest(
      this.http.get<CommercialUnitResource[]>(galleryUnitsUrl(galleryId)),
      failed,
    );
    return resources.map((r) => this.unitAssembler.toEntityFromResource(r));
  }

  async getUnit(unitId: string): Promise<CommercialUnit> {
    const resource = await sendRequest(
      this.http.get<CommercialUnitResource>(`${unitsUrl}/${encodeURIComponent(unitId)}`),
      failed,
    );
    return this.unitAssembler.toEntityFromResource(resource);
  }

  async registerUnit(unit: CommercialUnit): Promise<CommercialUnit> {
    const resource = await sendRequest(
      this.http.post<CommercialUnitResource>(
        galleryUnitsUrl(unit.galleryId),
        this.unitAssembler.toRegisterRequestFromEntity(unit),
      ),
      failed,
    );
    return this.unitAssembler.toEntityFromResource(resource);
  }

  async updateUnit(unit: CommercialUnit): Promise<CommercialUnit> {
    const resource = await sendRequest(
      this.http.patch<CommercialUnitResource>(
        `${unitsUrl}/${encodeURIComponent(unit.id)}`,
        this.unitAssembler.toUpdateRequestFromEntity(unit),
      ),
      failed,
    );
    return this.unitAssembler.toEntityFromResource(resource);
  }

  async removeUnit(unit: CommercialUnit): Promise<void> {
    await sendRequest(
      this.http.patch(`${unitsUrl}/${encodeURIComponent(unit.id)}`, { active: false }),
      failed,
    );
  }

  async listInvitations(): Promise<TenantInvitation[]> {
    const resources = await sendRequest(
      this.http.get<TenantInvitationResource[]>(invitationsUrl),
      failed,
    );
    return resources.map((r) => this.invitationAssembler.toEntityFromResource(r));
  }

  async sendInvitation(invitation: TenantInvitation): Promise<TenantInvitation> {
    const body: InviteTenantResource = { email: invitation.email };
    const resource = await sendRequest(
      this.http.post<TenantInvitationResource>(unitInviteUrl(invitation.unitId), body),
      failed,
    );
    return this.invitationAssembler.toEntityFromResource(resource);
  }

  async revokeInvitation(invitationId: string): Promise<TenantInvitation> {
    const resource = await sendRequest(
      this.http.patch<TenantInvitationResource>(
        `${invitationsUrl}/${encodeURIComponent(invitationId)}/revoke`,
        null,
      ),
      failed,
    );
    return this.invitationAssembler.toEntityFromResource(resource);
  }
}
