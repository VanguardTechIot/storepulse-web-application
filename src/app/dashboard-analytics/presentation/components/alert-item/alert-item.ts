import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { TranslationService } from '../../../../shared/infrastructure/i18n/translation.service';
import { StatusChip } from '../../../../shared/presentation/components/status-chip/status-chip';
import { Tone, ToneIcon } from '../../../../shared/presentation/components/tone-icon/tone-icon';
import { LocalizedDatePipe } from '../../../../shared/presentation/pipes/localized-date.pipe';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { AlertStatus } from '../../../domain/enums/alert-status.enum';
import { SensorType } from '../../../domain/enums/sensor-type.enum';
import { Alert } from '../../../domain/model/alert.entity';

// Same colors as the device LED: red for security events, amber for environment and consumption.
const STYLES: Record<SensorType, { icon: string; tone: Tone }> = {
  [SensorType.Motion]: { icon: 'directions_walk', tone: 'danger' },
  [SensorType.Smoke]: { icon: 'local_fire_department', tone: 'danger' },
  [SensorType.Temperature]: { icon: 'device_thermostat', tone: 'warning' },
  [SensorType.Humidity]: { icon: 'humidity_percentage', tone: 'info' },
  [SensorType.Electricity]: { icon: 'bolt', tone: 'warning' },
  [SensorType.Water]: { icon: 'water_drop', tone: 'info' },
};

const STATUS_TONES: Record<AlertStatus, Tone> = {
  [AlertStatus.Active]: 'danger',
  [AlertStatus.Acknowledged]: 'warning',
  [AlertStatus.Resolved]: 'success',
};

/** One alert row: sensor, measured value, state and, when actionable, its next step. */
@Component({
  selector: 'app-alert-item',
  imports: [MatButtonModule, StatusChip, ToneIcon, TranslatePipe, LocalizedDatePipe],
  templateUrl: './alert-item.html',
  styleUrl: './alert-item.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertItem {
  private readonly i18n = inject(TranslationService);

  readonly alert = input.required<Alert>();
  readonly actionable = input(false);
  readonly busy = input(false);
  readonly acknowledged = output<Alert>();
  readonly resolved = output<Alert>();

  protected readonly style = computed(() => STYLES[this.alert().sensorType]);
  protected readonly statusTone = computed(() => STATUS_TONES[this.alert().status]);
  protected readonly value = computed(() =>
    this.alert().measuredValue.toLocaleString(this.i18n.lang(), { maximumFractionDigits: 1 }),
  );
}
