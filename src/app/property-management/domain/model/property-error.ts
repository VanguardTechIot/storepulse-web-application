/**
 * Business outcomes that prevent a Property Management operation from completing.
 * The value doubles as the i18n key suffix (`property.errors.<code>`).
 */
export enum PropertyErrorCode {
  InvalidGalleryName = 'invalid_gallery_name',
  InvalidAddress = 'invalid_address',
  InvalidTotalUnits = 'invalid_total_units',
  GalleryNotFound = 'gallery_not_found',
  GalleryAlreadyRegistered = 'gallery_already_registered',
  InvalidUnitCode = 'invalid_unit_code',
  InvalidFloor = 'invalid_floor',
  InvalidArea = 'invalid_area',
  InvalidBusinessName = 'invalid_business_name',
  DuplicatedUnitCode = 'duplicated_unit_code',
  DuplicatedCommonAreaName = 'duplicated_common_area_name',
  UnitNotFound = 'unit_not_found',
  UnitHasDevices = 'unit_has_devices',
  UnitOccupied = 'unit_occupied',
  UnitNotAvailable = 'unit_not_available',
  CommonAreaWithoutTenant = 'common_area_without_tenant',
  InvalidEmail = 'invalid_email',
  InvitationNotPending = 'invitation_not_pending',
  Unexpected = 'unexpected',
}

export class PropertyError extends Error {
  constructor(
    readonly code: PropertyErrorCode,
    /** Extra values for the message, such as the devices that block a removal (TS-09). */
    readonly details: Record<string, string | number> = {},
  ) {
    super(code);
    this.name = 'PropertyError';
  }
}
