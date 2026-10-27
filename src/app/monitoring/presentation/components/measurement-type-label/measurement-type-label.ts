import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Icon } from '../../../../shared/presentation/components/icon/icon';
import { IconName } from '../../../../shared/presentation/components/icon/icon-paths';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { MeasurementType } from '../../../domain/model/measurement-type';

export const MEASUREMENT_TYPE_ICONS: Record<MeasurementType, { icon: IconName; tone: string }> = {
  TEMPERATURE: { icon: 'thermometer', tone: 'ico-red' },
  HUMIDITY: { icon: 'humidity', tone: 'ico-cyan' },
  ELECTRICITY: { icon: 'bolt', tone: 'ico-amber' },
  WATER: { icon: 'drop', tone: 'ico-blue' },
};

/**
 * Icon and localized name of a measurement type.
 */
@Component({
  selector: 'app-measurement-type-label',
  imports: [Icon, TranslatePipe],
  template: `
    <span class="li-ico" [class]="'li-ico ' + config[type()].tone" [style.width.px]="iconBox()" [style.height.px]="iconBox()">
      <app-icon [name]="config[type()].icon" [size]="iconBox() > 30 ? 18 : 16" />
    </span>
    @if (showLabel()) {
      <span>{{ 'monitoring.measurementTypes.' + type() | translate }}</span>
    }
  `,
  styles: `
    :host { display: inline-flex; align-items: center; gap: 10px; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MeasurementTypeLabel {
  readonly type = input.required<MeasurementType>();
  readonly showLabel = input(true);
  readonly iconBox = input(30);
  protected readonly config = MEASUREMENT_TYPE_ICONS;
}
