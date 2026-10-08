import { ChangeDetectionStrategy, Component, computed, effect, signal } from '@angular/core';
import { Icon } from '../../../../shared/presentation/components/icon/icon';
import { ViewState } from '../../../../shared/presentation/components/view-state/view-state';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { LocalizedDatePipe } from '../../../../shared/presentation/pipes/localized-date.pipe';
import { LocalizedNumberPipe } from '../../../../shared/presentation/pipes/localized-number.pipe';
import { ConsumptionHistoryChart } from '../../components/consumption-history-chart/consumption-history-chart';
import { MeasurementTypeLabel } from '../../components/measurement-type-label/measurement-type-label';
import { CONSUMPTION_TYPES, ConsumptionType, MEASUREMENT_UNITS } from '../../../domain/model/measurement-type';
import { Consumption } from '../../../domain/model/consumption.entity';
import { ConsumptionBaseline, MIN_BASELINE_PERIODS } from '../../../domain/model/consumption-baseline';
import { MonitoredResource } from '../../../domain/model/monitored-resource';
import { MonitoringView } from '../monitoring-view';

type RowStatus = 'WITH_BASELINE' | 'NO_BASELINE' | 'NO_DATA';

interface ConsumptionRow {
  resource: MonitoredResource;
  /** Baseline per metered type; types without a meter are absent. */
  byType: Partial<Record<ConsumptionType, ConsumptionBaseline>>;
  status: RowStatus;
}

const ROW_STATUS_TONES: Record<RowStatus, string> = {
  WITH_BASELINE: 'b-green',
  NO_BASELINE: 'b-gray',
  NO_DATA: 'b-violet',
};

const HISTORY_PERIODS = 12;

/**
 * Consolidated utility consumption of the gallery and consumption history per location.
 */
@Component({
  selector: 'app-consumption',
  imports: [
    Icon,
    ViewState,
    TranslatePipe,
    LocalizedDatePipe,
    LocalizedNumberPipe,
    ConsumptionHistoryChart,
    MeasurementTypeLabel,
  ],
  templateUrl: './consumption.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConsumptionView extends MonitoringView {
  protected readonly consumptionTypes = CONSUMPTION_TYPES;
  protected readonly units = MEASUREMENT_UNITS;
  protected readonly statusTones = ROW_STATUS_TONES;
  protected readonly minBaselinePeriods = MIN_BASELINE_PERIODS;

  protected readonly period = signal('');
  protected readonly selectedResourceId = signal('');
  protected readonly selectedType = signal<ConsumptionType>('ELECTRICITY');

  /** Periods with records plus the current calendar month, most recent first. */
  protected readonly periodOptions = computed(() => {
    const current = Consumption.periodKeyOf(new Date());
    return [...new Set([current, ...this.store.consumptionPeriods()])].sort().reverse();
  });

  /** Locations with utility meters or consumption history. */
  private readonly meteredResources = computed(() =>
    this.store.resources().filter(
      (resource) =>
        resource.monitoredTypes.some((type) => CONSUMPTION_TYPES.includes(type as ConsumptionType)) ||
        this.store.consumption().some((c) => c.resourceId === resource.resourceId),
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

  protected readonly rowsWithoutData = computed(() => this.rows().filter((row) => row.status === 'NO_DATA').length);

  /** Latest measured date when the selected period is still open. */
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
    () => this.rows().find((row) => row.resource.resourceId === this.selectedResourceId()) ?? this.rows()[0] ?? null,
  );

  protected readonly selectedBaseline = computed(() => this.selectedRow()?.byType[this.selectedType()] ?? null);

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
    // Select the most recent period with records once the data is available.
    effect(() => {
      const latest = this.store.consumptionPeriods()[0];
      if (!this.period() && latest) this.period.set(latest);
    });
    // Keep a consumption type that exists for the selected location.
    effect(() => {
      const row = this.selectedRow();
      if (row && !row.byType[this.selectedType()]) {
        const available = CONSUMPTION_TYPES.find((type) => row.byType[type]);
        if (available) this.selectedType.set(available);
      }
    });
  }

  protected periodDate(key: string): Date {
    const [year, month] = key.split('-').map(Number);
    return new Date(year, month - 1, 15);
  }

  protected selectResource(resourceId: string): void {
    this.selectedResourceId.set(resourceId);
  }
}
