import { Component, computed, input } from '@angular/core';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { CommercialUnit } from '../../../domain/model/commercial-unit.entity';
import { UnitStatus } from '../../../domain/model/unit-status.enum';

const tones: Record<UnitStatus, string> = {
  [UnitStatus.Available]: 'badge--success',
  [UnitStatus.Occupied]: 'badge--violet',
  [UnitStatus.Maintenance]: 'badge--warning',
};

/** Status of a unit; common areas show their kind, since they are never occupied. */
@Component({
  selector: 'app-unit-status-badge',
  imports: [TranslatePipe],
  template: `<span [class]="'badge ' + tone()">{{ label() | translate }}</span>`,
})
export class UnitStatusBadge {
  readonly unit = input.required<CommercialUnit>();

  protected readonly tone = computed(() => {
    const unit = this.unit();
    if (!unit.active) return 'badge--neutral';
    if (unit.isCommonArea && !unit.isUnderMaintenance) return 'badge--neutral';
    return tones[unit.status];
  });

  protected readonly label = computed(() => {
    const unit = this.unit();
    if (!unit.active) return 'property.status.REMOVED';
    if (unit.isCommonArea && !unit.isUnderMaintenance) return 'property.types.COMMON_AREA';
    return `property.status.${unit.status}`;
  });
}
