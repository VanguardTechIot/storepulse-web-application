import { inject, Injectable } from '@angular/core';
import { CommercialUnit } from '../../../property-management/domain/model/commercial-unit.entity';
import { PROPERTY_MANAGEMENT_REPOSITORY } from '../../../property-management/infrastructure/property-management.token';
import { UnitReference } from '../../domain/model/unit-reference';

/**
 * Anti-corruption layer towards Property Management: the units of the gallery of the signed-in
 * administrator. The platform changes their occupancy when a tenant is assigned or leaves.
 */
@Injectable({ providedIn: 'root' })
export class PropertyContextFacade {
  private readonly repository = inject(PROPERTY_MANAGEMENT_REPOSITORY);

  /** Screen where the administrator registers the gallery and its units. */
  readonly unitsRoute = ['/commercial-units'];

  /** Active units of the gallery; empty when it has none yet. */
  async listUnits(): Promise<UnitReference[]> {
    const gallery = await this.repository.findGallery();
    if (!gallery) return [];
    const units = await this.repository.listUnits(gallery.id);
    return units.filter((unit) => unit.active).map((unit) => this.toReference(unit));
  }

  private toReference(unit: CommercialUnit): UnitReference {
    return {
      id: unit.id,
      code: unit.code,
      floor: unit.floor,
      businessName: unit.businessName,
      isStore: unit.isStore,
      isAvailable: unit.canReceiveTenant(),
    };
  }
}
