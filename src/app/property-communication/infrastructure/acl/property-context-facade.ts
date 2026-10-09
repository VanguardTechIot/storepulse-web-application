import { inject, Injectable } from '@angular/core';
import { CommercialUnit } from '../../../property-management/domain/model/commercial-unit.entity';
import { PropertyError } from '../../../property-management/domain/model/property-error';
import { PROPERTY_MANAGEMENT_REPOSITORY } from '../../../property-management/infrastructure/property-management.token';
import { CommunicationError, CommunicationErrorCode } from '../../domain/model/communication-error';
import { UnitReference } from '../../domain/model/unit-reference';

/**
 * Anti-corruption layer towards Property Management: the units of the gallery of the
 * administrator, and the change of their occupancy when a tenant is assigned or leaves.
 */
@Injectable({ providedIn: 'root' })
export class PropertyContextFacade {
  private readonly repository = inject(PROPERTY_MANAGEMENT_REPOSITORY);

  /** Screen where the administrator registers the gallery and its units. */
  readonly unitsRoute = ['/commercial-units'];

  /** Active units of the gallery managed by the administrator; empty when it has none yet. */
  async listUnits(administratorId: string): Promise<UnitReference[]> {
    const gallery = await this.repository.findGalleryByAdministrator(administratorId);
    if (!gallery) return [];
    const units = await this.repository.listUnits(gallery.id);
    return units.filter((unit) => unit.active).map((unit) => this.toReference(unit));
  }

  /** AssignTenantToUnitCommand of Property Management: the store becomes occupied. */
  async occupyUnit(unitId: string): Promise<void> {
    await this.change(unitId, (unit) => unit.assignTenant());
  }

  /** VacateCommercialUnitCommand of Property Management: the store becomes free. */
  async vacateUnit(unitId: string): Promise<void> {
    await this.change(unitId, (unit) => unit.vacate());
  }

  private async change(unitId: string, change: (unit: CommercialUnit) => CommercialUnit) {
    try {
      const unit = await this.repository.getUnit(unitId);
      await this.repository.updateUnit(change(unit));
    } catch (error) {
      if (error instanceof PropertyError) {
        throw new CommunicationError(CommunicationErrorCode.UnitNotAvailable);
      }
      throw error;
    }
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
