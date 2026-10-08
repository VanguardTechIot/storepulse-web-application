import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { AlertStatus } from '../../../domain/model/alert.entity';

const STATUS_TONES: Record<AlertStatus, string> = {
  ACTIVE: 'b-red',
  ACKNOWLEDGED: 'b-blue',
  RESOLVED: 'b-green',
};

/**
 * Badge for the alert lifecycle status.
 */
@Component({
  selector: 'app-alert-status-badge',
  imports: [TranslatePipe],
  template: `<span class="badge" [class]="'badge ' + tones[status()]">{{
    'monitoring.alertStatus.' + status() | translate
  }}</span>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertStatusBadge {
  readonly status = input.required<AlertStatus>();
  protected readonly tones = STATUS_TONES;
}
