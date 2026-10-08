import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { Icon } from '../../../../shared/presentation/components/icon/icon';
import { ViewState } from '../../../../shared/presentation/components/view-state/view-state';
import { ConfirmDialog } from '../../../../shared/presentation/components/confirm-dialog/confirm-dialog';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { LocalizedDatePipe } from '../../../../shared/presentation/pipes/localized-date.pipe';
import { LocalizedNumberPipe } from '../../../../shared/presentation/pipes/localized-number.pipe';
import { MeasurementTypeLabel } from '../../components/measurement-type-label/measurement-type-label';
import { MEASUREMENT_UNITS } from '../../../domain/model/measurement-type';
import { MonitoringRule } from '../../../domain/model/monitoring-rule.entity';
import { MonitoringView } from '../monitoring-view';

/**
 * Monitoring rules and thresholds, with the enable / disable operations of the domain.
 */
@Component({
  selector: 'app-monitoring-rules',
  imports: [
    Icon,
    ViewState,
    ConfirmDialog,
    TranslatePipe,
    LocalizedDatePipe,
    LocalizedNumberPipe,
    MeasurementTypeLabel,
  ],
  templateUrl: './monitoring-rules.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MonitoringRules extends MonitoringView {
  protected readonly units = MEASUREMENT_UNITS;

  protected readonly pendingRule = signal<MonitoringRule | null>(null);
  protected readonly busy = signal(false);

  protected readonly rows = computed(() =>
    this.store.rules().map((rule) => {
      const alerts = this.store.alerts().filter((alert) => alert.ruleId === rule.id);
      return { rule, total: alerts.length, open: alerts.filter((alert) => alert.isOpen).length };
    }),
  );

  protected readonly enabledCount = computed(() => this.store.rules().filter((rule) => rule.enabled).length);

  protected async confirmToggle(): Promise<void> {
    const rule = this.pendingRule();
    if (!rule) return;
    this.busy.set(true);
    try {
      await this.store.setRuleEnabled(rule.id, !rule.enabled);
      const key = rule.enabled ? 'disabled' : 'enabled';
      this.toast.show('success', this.t(`monitoring.rules.toggle.${key}`, { rule: rule.name }));
    } catch {
      this.showRequestError();
    } finally {
      this.busy.set(false);
      this.pendingRule.set(null);
    }
  }
}
