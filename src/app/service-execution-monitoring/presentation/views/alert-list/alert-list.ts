import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Icon } from '../../../../shared/presentation/components/icon/icon';
import { ViewState } from '../../../../shared/presentation/components/view-state/view-state';
import { paginate, Paginator } from '../../../../shared/presentation/components/paginator/paginator';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { LocalizedDatePipe } from '../../../../shared/presentation/pipes/localized-date.pipe';
import { LocalizedNumberPipe } from '../../../../shared/presentation/pipes/localized-number.pipe';
import { DurationPipe } from '../../../../shared/presentation/pipes/duration.pipe';
import { MeasurementTypeLabel } from '../../components/measurement-type-label/measurement-type-label';
import { AlertStatusBadge } from '../../components/alert-status-badge/alert-status-badge';
import { ALERT_STATUSES, AlertStatus } from '../../../domain/model/alert.entity';
import { MEASUREMENT_TYPES, MeasurementType, MEASUREMENT_UNITS } from '../../../domain/model/measurement-type';
import { MonitoringView } from '../monitoring-view';

type StatusFilter = AlertStatus | 'ALL';

const ALERTS_PAGE_SIZE = 8;

/**
 * Alert history with status, measurement type and location filters.
 */
@Component({
  selector: 'app-alert-list',
  host: { class: 'monitoring-page' },
  imports: [
    RouterLink,
    UpperCasePipe,
    Icon,
    ViewState,
    Paginator,
    TranslatePipe,
    LocalizedDatePipe,
    LocalizedNumberPipe,
    DurationPipe,
    MeasurementTypeLabel,
    AlertStatusBadge,
  ],
  templateUrl: './alert-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertList extends MonitoringView {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly queryParams = toSignal(this.route.queryParamMap, { requireSync: true });

  protected readonly statusFilters: StatusFilter[] = ['ALL', ...ALERT_STATUSES];
  protected readonly measurementTypes = MEASUREMENT_TYPES;
  protected readonly units = MEASUREMENT_UNITS;
  protected readonly pageSize = ALERTS_PAGE_SIZE;

  // Filters live in the URL so a filtered list can be linked from other views.
  protected readonly status = computed<StatusFilter>(() => {
    const value = this.queryParams().get('status') as AlertStatus | null;
    return value && ALERT_STATUSES.includes(value) ? value : 'ALL';
  });
  protected readonly type = computed(() => (this.queryParams().get('type') ?? '') as MeasurementType | '');
  protected readonly resourceId = computed(() => this.queryParams().get('resource') ?? '');
  protected readonly search = signal('');
  protected readonly page = signal(1);

  /** Alerts matching every filter except the status, used for the tab counters. */
  private readonly baseFiltered = computed(() => {
    const type = this.type();
    const resourceId = this.resourceId();
    const term = this.search().trim().toLowerCase();
    return this.store.alertDetails().filter(
      (details) =>
        (!type || details.rule?.measurementType === type) &&
        (!resourceId || details.resource?.resourceId === resourceId) &&
        (!term ||
          [details.alert.id, details.rule?.name, details.resource?.name, details.resource?.description].some((text) =>
            text?.toLowerCase().includes(term),
          )),
    );
  });

  protected readonly filtered = computed(() => {
    const status = this.status();
    return this.baseFiltered().filter((details) => status === 'ALL' || details.alert.status === status);
  });

  protected readonly pagedAlerts = computed(() => paginate(this.filtered(), this.page(), ALERTS_PAGE_SIZE));

  protected readonly hasFilters = computed(
    () => this.status() !== 'ALL' || !!this.type() || !!this.resourceId() || !!this.search().trim(),
  );

  protected countFor(status: StatusFilter): number {
    return status === 'ALL'
      ? this.baseFiltered().length
      : this.baseFiltered().filter((details) => details.alert.status === status).length;
  }

  protected setFilter(name: 'status' | 'type' | 'resource', value: string): void {
    this.page.set(1);
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { [name]: value && value !== 'ALL' ? value : null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  protected setSearch(value: string): void {
    this.page.set(1);
    this.search.set(value);
  }

  protected clearFilters(): void {
    this.search.set('');
    this.page.set(1);
    void this.router.navigate([], { relativeTo: this.route, queryParams: {}, replaceUrl: true });
  }
}
