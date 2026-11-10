import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Tone, ToneIcon } from '../../../../shared/presentation/components/tone-icon/tone-icon';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { MeasurementType } from '../../../domain/model/measurement-type';

export const MEASUREMENT_TYPE_ICONS: Record<MeasurementType, { icon: string; tone: Tone }> = {
  TEMPERATURE: { icon: 'thermostat', tone: 'danger' },
  HUMIDITY: { icon: 'humidity_percentage', tone: 'primary' },
  ELECTRICITY: { icon: 'bolt', tone: 'warning' },
  WATER: { icon: 'water_drop', tone: 'info' },
  MOTION: { icon: 'directions_run', tone: 'violet' },
  SMOKE: { icon: 'detector_smoke', tone: 'neutral' },
};

@Component({
  selector: 'app-measurement-type-label',
  imports: [ToneIcon, TranslatePipe],
  templateUrl: './measurement-type-label.html',
  styleUrl: './measurement-type-label.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MeasurementTypeLabel {
  readonly type = input.required<MeasurementType>();
  readonly showLabel = input(true);
  readonly iconBox = input(30);
  protected readonly config = MEASUREMENT_TYPE_ICONS;
}
