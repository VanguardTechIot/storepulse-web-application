/**
 * Gallery that contracts the subscription, as Property Management describes it.
 * Only the data this context needs: identifier, name and monitored units.
 */
export interface GalleryReference {
  galleryId: string;
  name: string;
  /** Units (stores and common areas) currently registered and not removed. */
  monitoredUnitCount: number;
}
