import { ChangeDetectionStrategy, Component, computed, effect, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../../../../shared/presentation/components/icon/icon';
import { ViewState } from '../../../../shared/presentation/components/view-state/view-state';
import { paginate, Paginator } from '../../../../shared/presentation/components/paginator/paginator';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { LocalizedDatePipe } from '../../../../shared/presentation/pipes/localized-date.pipe';
import { LocalizedNumberPipe } from '../../../../shared/presentation/pipes/localized-number.pipe';
import { MeasurementTypeLabel } from '../../components/measurement-type-label/measurement-type-label';
import { MEASUREMENT_TYPES, MeasurementType } from '../../../domain/model/measurement-type';
import { ResourceMonitoringState } from '../../../application/monitoring.store';
import { MonitoringView } from '../monitoring-view';

type StateFilter = 'ALL' | Exclude<ResourceMonitoringState, 'NORMAL'>;

const STATE_TONES: Record<ResourceMonitoringState, string> = {
  NORMAL: 'b-green',
  OPEN_ALERT: 'b-red',
  NO_MONITORING: 'b-violet',
};

const MEASUREMENTS_PAGE_SIZE = 10;

/**
 * Monitoring overview: monitoring state of each location and latest telemetry received.
 */
@Component({
  selector: 'app-telemetry-dashboard',
  imports: [
    RouterLink,
    Icon,
    ViewState,
    Paginator,
    TranslatePipe,
    LocalizedDatePipe,
    LocalizedNumberPipe,
    MeasurementTypeLabel,
  ],
  templateUrl: './telemetry-dashboard.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TelemetryDashboard extends MonitoringView {
  protected readonly stateTones = STATE_TONES;
  protected readonly measurementTypes = MEASUREMENT_TYPES;
  protected readonly stateFilters: StateFilter[] = ['ALL', 'OPEN_ALERT', 'NO_MONITORING'];
  protected readonly pageSize = MEASUREMENTS_PAGE_SIZE;

  protected readonly stateFilter = signal<StateFilter>('ALL');
  protected readonly typeFilter = signal<MeasurementType | ''>('');
  protected readonly resourceFilter = signal('');
  protected readonly page = signal(1);

  protected readonly monitoredCount = computed(
    () => this.store.resourceStatuses().filter((s) => s.state !== 'NO_MONITORING').length,
  );
  protected readonly withoutMonitoringCount = computed(
    () => this.store.resourceStatuses().filter((s) => s.state === 'NO_MONITORING').length,
  );

  protected readonly visibleStatuses = computed(() => {
    const filter = this.stateFilter();
    return this.store.resourceStatuses().filter((s) => filter === 'ALL' || s.state === filter);
  });

  protected stateCount(filter: StateFilter): number {
    return filter === 'ALL'
      ? this.store.resourceStatuses().length
      : this.store.resourceStatuses().filter((s) => s.state === filter).length;
  }

  protected readonly filteredMeasurements = computed(() => {
    const type = this.typeFilter();
    const resourceId = this.resourceFilter();
    return this.store
      .measurementRows()
      .filter((row) => (!type || row.measurement.type === type) && (!resourceId || row.resource?.resourceId === resourceId));
  });

  protected readonly pagedMeasurements = computed(() =>
    paginate(this.filteredMeasurements(), this.page(), MEASUREMENTS_PAGE_SIZE),
  );

  constructor() {
    super();
    // Go back to the first page whenever the filters change.
    effect(() => {
      this.typeFilter();
      this.resourceFilter();
      this.page.set(1);
    });
  }
}
