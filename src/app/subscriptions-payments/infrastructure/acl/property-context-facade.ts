import { inject, Injectable } from '@angular/core';
import { PROPERTY_MANAGEMENT_REPOSITORY } from '../../../property-management/infrastructure/property-management.token';
import { GalleryReference } from '../../domain/model/gallery-reference';

/**
 * Anti-corruption layer towards Property Management: translates the gallery of the administrator
 * and its registered units into the reference this context needs (GalleryId, monitored units).
 */
@Injectable({ providedIn: 'root' })
export class PropertyContextFacade {
  private readonly repository = inject(PROPERTY_MANAGEMENT_REPOSITORY);

  /** Gallery registration, where a new administrator must start before subscribing. */
  readonly galleryRegistrationRoute = ['/commercial-units/gallery'];

  /** Gallery of the signed-in administrator, or `null` when it was not registered yet. */
  async getGallery(): Promise<GalleryReference | null> {
    const gallery = await this.repository.findGallery();
    if (!gallery) return null;
    const units = await this.repository.listUnits(gallery.id);
    return {
      galleryId: gallery.id,
      name: gallery.name,
      monitoredUnitCount: units.filter((unit) => unit.active).length,
    };
  }
}
