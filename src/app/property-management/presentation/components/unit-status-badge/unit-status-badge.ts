import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { StatusChip } from '../../../../shared/presentation/components/status-chip/status-chip';
import { Tone } from '../../../../shared/presentation/components/tone-icon/tone-icon';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { CommercialUnit } from '../../../domain/model/commercial-unit.entity';
import { UnitStatus } from '../../../domain/model/unit-status.enum';

const tones: Record<UnitStatus, Tone> = {
  [UnitStatus.Available]: 'success',
  [UnitStatus.Occupied]: 'violet',
  [UnitStatus.Maintenance]: 'warning',
};

/** Status of a unit; common areas show their kind, since they are never occupied. */
@Component({
  selector: 'app-unit-status-badge',
  imports: [StatusChip, TranslatePipe],
  templateUrl: './unit-status-badge.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnitStatusBadge {
  readonly unit = input.required<CommercialUnit>();

  protected readonly tone = computed<Tone>(() => {
    const unit = this.unit();
    if (!unit.active) return 'neutral';
    if (unit.isCommonArea && !unit.isUnderMaintenance) return 'neutral';
    return tones[unit.status];
  });

  protected readonly label = computed(() => {
    const unit = this.unit();
    if (!unit.active) return 'property.status.REMOVED';
    if (unit.isCommonArea && !unit.isUnderMaintenance) return 'property.types.COMMON_AREA';
    return `property.status.${unit.status}`;
  });
}
