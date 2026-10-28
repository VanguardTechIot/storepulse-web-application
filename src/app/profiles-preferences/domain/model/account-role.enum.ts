/**
 * Role of the account that owns the profile, as this context shows it (US-06).
 * Identity and Access Management decides it; the anti-corruption layer translates it.
 */
export enum AccountRole {
  /** Administrator responsible for managing a gallery. */
  GalleryAdministrator = 'GALLERY_ADMINISTRATOR',

  /** Tenant account associated with a gallery unit. */
  Tenant = 'TENANT',
}
