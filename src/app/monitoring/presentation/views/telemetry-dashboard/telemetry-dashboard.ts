import { ChangeDetectionStrategy, Component, computed, effect, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { KpiCard } from '../../../../shared/presentation/components/kpi-card/kpi-card';
import { PageState } from '../../../../shared/presentation/components/page-state/page-state';
import { StatusChip } from '../../../../shared/presentation/components/status-chip/status-chip';
import { Tone } from '../../../../shared/presentation/components/tone-icon/tone-icon';
import { LocalizedDatePipe } from '../../../../shared/presentation/pipes/localized-date.pipe';
import { LocalizedNumberPipe } from '../../../../shared/presentation/pipes/localized-number.pipe';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { ResourceMonitoringState } from '../../../application/monitoring.store';
import { MEASUREMENT_TYPES, MeasurementType } from '../../../domain/model/measurement-type';
import { MeasurementTypeLabel } from '../../components/measurement-type-label/measurement-type-label';
import { MonitoringView } from '../monitoring-view';

type StateFilter = 'ALL' | Exclude<ResourceMonitoringState, 'NORMAL'>;

const STATE_TONES: Record<ResourceMonitoringState, Tone> = {
  NORMAL: 'success',
  MOTION_DETECTED: 'warning',
  NO_MONITORING: 'violet',
};

/** Monitoring status of each location and the latest measurements received. */
@Component({
  selector: 'app-telemetry-dashboard',
  imports: [
    KpiCard,
    LocalizedDatePipe,
    LocalizedNumberPipe,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatPaginatorModule,
    MatSelectModule,
    MatTableModule,
    MeasurementTypeLabel,
    PageState,
    StatusChip,
    TranslatePipe,
  ],
  templateUrl: './telemetry-dashboard.html',
  styleUrls: [
    '../../../../shared/presentation/styles/storepulse-theme.css',
    '../../../../shared/presentation/styles/page.css',
    '../monitoring.css',
    './telemetry-dashboard.css',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TelemetryDashboard extends MonitoringView {
  protected readonly measurementTypes = MEASUREMENT_TYPES;
  protected readonly stateFilters: StateFilter[] = ['ALL', 'MOTION_DETECTED', 'NO_MONITORING'];
  protected readonly locationColumns = [
    'location',
    'device',
    'temperature',
    'humidity',
    'motion',
    'lastTelemetry',
    'status',
  ];
  protected readonly measurementColumns = ['recordedAt', 'location', 'type', 'value'];
  protected readonly pageSize = 10;

  protected readonly stateFilter = signal<StateFilter>('ALL');
  protected readonly typeFilter = signal<MeasurementType | ''>('');
  protected readonly resourceFilter = signal('');
  protected readonly pageIndex = signal(0);

  protected readonly monitoredCount = computed(() =>
    this.countByState('NORMAL', 'MOTION_DETECTED'),
  );
  protected readonly motionDetectedCount = computed(() => this.countByState('MOTION_DETECTED'));
  protected readonly withoutMonitoringCount = computed(() => this.countByState('NO_MONITORING'));

  protected readonly visibleStatuses = computed(() => {
    const filter = this.stateFilter();
    return this.store.resourceStatuses().filter((s) => filter === 'ALL' || s.state === filter);
  });

  protected readonly filteredMeasurements = computed(() => {
    const type = this.typeFilter();
    const resourceId = this.resourceFilter();
    return this.store
      .measurementRows()
      .filter(
        (row) =>
          (!type || row.measurement.type === type) &&
          (!resourceId || row.resource?.resourceId === resourceId),
      );
  });

  protected readonly pagedMeasurements = computed(() => {
    const start = this.pageIndex() * this.pageSize;
    return this.filteredMeasurements().slice(start, start + this.pageSize);
  });

  constructor() {
    super();
    effect(() => {
      this.typeFilter();
      this.resourceFilter();
      this.pageIndex.set(0);
    });
  }

  protected stateCount(filter: StateFilter): number {
    return filter === 'ALL' ? this.store.resourceStatuses().length : this.countByState(filter);
  }

  protected stateTone(state: ResourceMonitoringState): Tone {
    return STATE_TONES[state];
  }

  private countByState(...states: ResourceMonitoringState[]): number {
    return this.store.resourceStatuses().filter((s) => states.includes(s.state)).length;
  }
}
