import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Icon } from '../../../../shared/presentation/components/icon/icon';
import { ViewState } from '../../../../shared/presentation/components/view-state/view-state';
import { ConfirmDialog } from '../../../../shared/presentation/components/confirm-dialog/confirm-dialog';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { LocalizedDatePipe } from '../../../../shared/presentation/pipes/localized-date.pipe';
import { LocalizedNumberPipe } from '../../../../shared/presentation/pipes/localized-number.pipe';
import { DurationPipe } from '../../../../shared/presentation/pipes/duration.pipe';
import { MeasurementTypeLabel } from '../../components/measurement-type-label/measurement-type-label';
import { AlertStatusBadge } from '../../components/alert-status-badge/alert-status-badge';
import { MEASUREMENT_UNITS } from '../../../domain/model/measurement-type';
import { AlertActionOutcome } from '../../../application/monitoring.store';
import { MonitoringView } from '../monitoring-view';

export const RESOLUTION_NOTE_MAX_LENGTH = 500;

/**
 * Alert detail and lifecycle actions: acknowledge (ACTIVE → ACKNOWLEDGED) and resolve (→ RESOLVED).
 */
@Component({
  selector: 'app-alert-detail',
  imports: [
    RouterLink,
    UpperCasePipe,
    Icon,
    ViewState,
    ConfirmDialog,
    TranslatePipe,
    LocalizedDatePipe,
    LocalizedNumberPipe,
    DurationPipe,
    MeasurementTypeLabel,
    AlertStatusBadge,
  ],
  templateUrl: './alert-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertDetail extends MonitoringView {
  /** Route parameter bound by the router. */
  readonly id = input.required<string>();

  protected readonly units = MEASUREMENT_UNITS;
  protected readonly noteMaxLength = RESOLUTION_NOTE_MAX_LENGTH;

  protected readonly details = computed(() => this.store.findAlertDetails(this.id()));

  protected readonly confirmingAcknowledge = signal(false);
  protected readonly confirmingResolve = signal(false);
  protected readonly busy = signal(false);

  protected readonly resolutionNote = signal('');
  protected readonly noteTouched = signal(false);
  protected readonly noteError = computed(() => {
    const note = this.resolutionNote().trim();
    if (!note) return 'monitoring.alertDetail.resolve.errors.required';
    if (note.length > RESOLUTION_NOTE_MAX_LENGTH) return 'monitoring.alertDetail.resolve.errors.maxLength';
    return null;
  });

  protected requestResolve(): void {
    this.noteTouched.set(true);
    if (!this.noteError()) this.confirmingResolve.set(true);
  }

  protected acknowledge(): Promise<void> {
    return this.runAction(
      () => this.store.acknowledgeAlert(this.id()),
      'monitoring.alertDetail.acknowledge.success',
      () => this.confirmingAcknowledge.set(false),
    );
  }

  protected resolve(): Promise<void> {
    return this.runAction(
      () => this.store.resolveAlert(this.id(), this.resolutionNote()),
      'monitoring.alertDetail.resolve.success',
      () => this.confirmingResolve.set(false),
    );
  }

  private async runAction(
    action: () => Promise<AlertActionOutcome>,
    successKey: string,
    close: () => void,
  ): Promise<void> {
    this.busy.set(true);
    try {
      const outcome = await action();
      if (outcome === 'updated') {
        this.toast.show('success', this.t(`${successKey}.title`), this.t(`${successKey}.message`));
      } else {
        this.toast.show(
          'warning',
          this.t('monitoring.alertDetail.alreadyChanged.title'),
          this.t('monitoring.alertDetail.alreadyChanged.message'),
        );
      }
    } catch {
      this.showRequestError();
    } finally {
      this.busy.set(false);
      close();
    }
  }
}
