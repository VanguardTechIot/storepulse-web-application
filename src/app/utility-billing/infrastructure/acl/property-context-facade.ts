import { inject, Injectable } from '@angular/core';
import { PROPERTY_MANAGEMENT_REPOSITORY } from '../../../property-management/infrastructure/property-management.token';
import { UnitReference } from '../../domain/model/unit-reference';

/**
 * Anti-corruption layer towards Property Management: the stores of the gallery that can be
 * billed, which are the ones linked to the monitored resource whose consumption is measured.
 */
@Injectable({ providedIn: 'root' })
export class PropertyContextFacade {
  private readonly repository = inject(PROPERTY_MANAGEMENT_REPOSITORY);

  async listUnits(): Promise<UnitReference[]> {
    const gallery = await this.repository.findGallery();
    if (!gallery) return [];
    return (await this.repository.listUnits(gallery.id))
      .filter((unit) => unit.active && unit.isStore && unit.resourceId !== null)
      .sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }))
      .map((unit) => ({ id: unit.id, code: unit.code, businessName: unit.businessName }));
  }
}
