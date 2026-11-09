import { ChangeDetectionStrategy, Component, computed, effect, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { Callout } from '../../../../shared/presentation/components/callout/callout';
import { KpiCard } from '../../../../shared/presentation/components/kpi-card/kpi-card';
import { PageState } from '../../../../shared/presentation/components/page-state/page-state';
import { StatusChip } from '../../../../shared/presentation/components/status-chip/status-chip';
import { Tone } from '../../../../shared/presentation/components/tone-icon/tone-icon';
import { LocalizedDatePipe } from '../../../../shared/presentation/pipes/localized-date.pipe';
import { LocalizedNumberPipe } from '../../../../shared/presentation/pipes/localized-number.pipe';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { Consumption } from '../../../domain/model/consumption.entity';
import {
  ConsumptionBaseline,
  MIN_BASELINE_PERIODS,
} from '../../../domain/model/consumption-baseline';
import {
  CONSUMPTION_TYPES,
  ConsumptionType,
  MEASUREMENT_UNITS,
} from '../../../domain/model/measurement-type';
import { MonitoredResource } from '../../../domain/model/monitored-resource';
import { ConsumptionHistoryChart } from '../../components/consumption-history-chart/consumption-history-chart';
import { MEASUREMENT_TYPE_ICONS } from '../../components/measurement-type-label/measurement-type-label';
import { MonitoringView } from '../monitoring-view';

type RowStatus = 'WITH_BASELINE' | 'NO_BASELINE' | 'NO_DATA';

interface ConsumptionRow {
  resource: MonitoredResource;
  byType: Partial<Record<ConsumptionType, ConsumptionBaseline>>;
  status: RowStatus;
}

const ROW_STATUS_TONES: Record<RowStatus, Tone> = {
  WITH_BASELINE: 'success',
  NO_BASELINE: 'neutral',
  NO_DATA: 'violet',
};

const HISTORY_PERIODS = 12;

/** Consolidated consumption of the period and history of each location against its baseline. */
@Component({
  selector: 'app-consumption',
  imports: [
    Callout,
    ConsumptionHistoryChart,
    KpiCard,
    LocalizedDatePipe,
    LocalizedNumberPipe,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatSelectModule,
    MatTableModule,
    PageState,
    StatusChip,
    TranslatePipe,
  ],
  templateUrl: './consumption.html',
  styleUrls: [
    '../../../../shared/presentation/styles/storepulse-theme.css',
    '../../../../shared/presentation/styles/page.css',
    '../monitoring.css',
    './consumption.css',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConsumptionView extends MonitoringView {
  protected readonly consumptionTypes = CONSUMPTION_TYPES;
  protected readonly units = MEASUREMENT_UNITS;
  protected readonly minBaselinePeriods = MIN_BASELINE_PERIODS;
  protected readonly typeIcons = MEASUREMENT_TYPE_ICONS;
  protected readonly columns = [
    'location',
    ...CONSUMPTION_TYPES.flatMap((type) => [type, type + '-deviation']),
    'status',
  ];

  protected readonly period = signal('');
  protected readonly selectedResourceId = signal('');
  protected readonly selectedType = signal<ConsumptionType>('ELECTRICITY');

  protected readonly periodOptions = computed(() => {
    const current = Consumption.periodKeyOf(new Date());
    return [...new Set([current, ...this.store.consumptionPeriods()])].sort().reverse();
  });

  private readonly meteredResources = computed(() =>
    this.store
      .resources()
      .filter(
        (resource) =>
          resource.monitoredTypes.some((type) =>
            CONSUMPTION_TYPES.includes(type as ConsumptionType),
          ) || this.store.consumption().some((c) => c.resourceId === resource.resourceId),
      ),
  );

  protected readonly rows = computed<ConsumptionRow[]>(() =>
    this.meteredResources().map((resource) => {
      const byType: Partial<Record<ConsumptionType, ConsumptionBaseline>> = {};
      for (const type of CONSUMPTION_TYPES) {
        const history = this.store.consumptionHistory(resource.resourceId, type);
        if (history.length > 0 || resource.monitoredTypes.includes(type)) {
          byType[type] = ConsumptionBaseline.from(history, this.period());
        }
      }
      const baselines = Object.values(byType);
      const status: RowStatus = baselines.every((b) => !b.current)
        ? 'NO_DATA'
        : baselines.every((b) => b.isAvailable)
          ? 'WITH_BASELINE'
          : 'NO_BASELINE';
      return { resource, byType, status };
    }),
  );

  protected readonly totals = computed(() => {
    const totals: Record<ConsumptionType, { value: number; records: number }> = {
      ELECTRICITY: { value: 0, records: 0 },
      WATER: { value: 0, records: 0 },
    };
    for (const row of this.rows()) {
      for (const type of CONSUMPTION_TYPES) {
        const current = row.byType[type]?.current;
        if (current) {
          totals[type].value += current.calculate();
          totals[type].records++;
        }
      }
    }
    return totals;
  });

  protected readonly periodHasData = computed(() =>
    CONSUMPTION_TYPES.some((type) => this.totals()[type].records > 0),
  );

  protected readonly rowsWithoutData = computed(
    () => this.rows().filter((row) => row.status === 'NO_DATA').length,
  );

  protected readonly openPeriodUntil = computed(() => {
    const [year, month] = this.period().split('-').map(Number);
    const nextMonthStart = Date.UTC(year, month, 1);
    const ends = this.rows()
      .flatMap((row) => Object.values(row.byType).map((b) => b.current?.periodEnd))
      .filter((end): end is Date => !!end);
    const latest = ends.length ? new Date(Math.max(...ends.map((d) => d.getTime()))) : null;
    return latest && latest.getTime() < nextMonthStart ? latest : null;
  });

  protected readonly selectedRow = computed(
    () =>
      this.rows().find((row) => row.resource.resourceId === this.selectedResourceId()) ??
      this.rows()[0] ??
      null,
  );

  protected readonly selectedBaseline = computed(
    () => this.selectedRow()?.byType[this.selectedType()] ?? null,
  );

  protected readonly selectedHistory = computed(() => {
    const row = this.selectedRow();
    if (!row) return [];
    return this.store
      .consumptionHistory(row.resource.resourceId, this.selectedType())
      .filter((c) => c.periodKey <= this.period())
      .slice(-HISTORY_PERIODS);
  });

  constructor() {
    super();
    effect(() => {
      const latest = this.store.consumptionPeriods()[0];
      if (!this.period() && latest) this.period.set(latest);
    });
    effect(() => {
      const row = this.selectedRow();
      if (row && !row.byType[this.selectedType()]) {
        const available = CONSUMPTION_TYPES.find((type) => row.byType[type]);
        if (available) this.selectedType.set(available);
      }
    });
  }

  protected statusTone(status: RowStatus): Tone {
    return ROW_STATUS_TONES[status];
  }

  protected periodDate(key: string): Date {
    const [year, month] = key.split('-').map(Number);
    return new Date(year, month - 1, 15);
  }
}
