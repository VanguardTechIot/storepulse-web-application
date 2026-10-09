import { computed, inject, Injectable, signal } from '@angular/core';
import { ConsumptionRegistration } from '../domain/model/consumption-registration.entity';
import { DashboardSummary, PeriodConsumption } from '../domain/model/dashboard-summary';
import { DeviceConnectivitySummary } from '../domain/model/device-connectivity-summary';
import { groupRepeatedNotifications } from '../domain/model/notification-grouping';
import { Notification } from '../domain/model/notification.entity';
import { NotificationType } from '../domain/model/notification-type.enum';
import { UtilityType } from '../domain/model/utility-type.enum';
import { MonitoringContextFacade } from '../infrastructure/acl/monitoring-context-facade';
import { ResourceAssetContextFacade } from '../infrastructure/acl/resource-asset-context-facade';
import { ANALYTICS_REPOSITORY } from '../infrastructure/analytics.token';

/** Monthly totals of one utility for one year; `null` for months without data. */
export interface YearlyConsumptionSeries {
  year: number;
  unit: string;
  values: (number | null)[];
}

type LoadStatus = 'idle' | 'loading' | 'loaded' | 'error';

/**
 * Application service of Dashboard and Analytics for the Web Application: Consolidated Dashboard
 * (US-50, TS-31) and Notification Center (US-49, TS-30).
 */
@Injectable({ providedIn: 'root' })
export class AnalyticsStore {
  private readonly repository = inject(ANALYTICS_REPOSITORY);
  private readonly monitoringContext = inject(MonitoringContextFacade);
  private readonly resourceAssetContext = inject(ResourceAssetContextFacade);

  private readonly status = signal<LoadStatus>('idle');
  /** True once the data has been loaded at least once; later refreshes keep showing it. */
  readonly ready = signal(false);
  readonly isLoading = computed(() => this.status() === 'loading' || this.status() === 'idle');
  readonly hasError = computed(() => this.status() === 'error');

  private readonly notificationsState = signal<Notification[]>([]);
  private readonly registrations = signal<ConsumptionRegistration[]>([]);
  private readonly openIncidents = signal<number | null>(null);
  private readonly devices = signal<DeviceConnectivitySummary | null>(null);

  readonly incidentsRoute = this.monitoringContext.incidentsRoute;
  readonly devicesRoute = this.resourceAssetContext.devicesRoute;

  // ---------- Notification Center ----------
  /** Repeated events grouped (TS-30), most recent first (US-49). */
  readonly notifications = computed(() => groupRepeatedNotifications(this.notificationsState()));
  readonly unreadCount = computed(() => this.notifications().filter((n) => !n.read).length);

  countByType(type: NotificationType | null): number {
    return this.notifications().filter((n) => type === null || n.type === type).length;
  }

  // ---------- Consolidated Dashboard ----------
  /** Most recent period with consumption (`YYYY-MM`). */
  readonly currentPeriod = computed(
    () => [...new Set(this.registrations().map((r) => r.period))].sort().at(-1) ?? null,
  );

  readonly summary = computed(() => {
    const devices = this.devices();
    return new DashboardSummary(
      this.openIncidents(),
      this.periodConsumption(UtilityType.Electricity),
      this.periodConsumption(UtilityType.Water),
      devices?.disconnected ?? null,
      devices?.total ?? null,
    );
  });

  /** Monthly series of the current year and the previous one, for the consumption chart. */
  yearlySeries(utility: UtilityType): YearlyConsumptionSeries[] {
    const current = this.currentPeriod();
    if (!current) return [];
    const year = Number(current.slice(0, 4));
    return [year - 1, year].map((y) => {
      const values: (number | null)[] = Array(12).fill(null);
      let unit = '';
      for (const r of this.registrations()) {
        if (r.utilityType !== utility || r.year !== y) continue;
        values[r.month - 1] = (values[r.month - 1] ?? 0) + r.value.amount;
        unit = r.value.unit;
      }
      return { year: y, unit, values };
    });
  }

  // ---------- Queries ----------
  /** Loads every dashboard query. Rejects when a data source cannot be reached. */
  async load(force = false): Promise<void> {
    if (!force && (this.status() === 'loaded' || this.status() === 'loading')) return;
    this.status.set('loading');
    try {
      const [notifications, registrations, openIncidents, devices] = await Promise.all([
        this.repository.listNotifications(),
        this.repository.listConsumptionRegistrations(),
        // An indicator without data is shown as empty instead of failing the dashboard (TS-31).
        this.monitoringContext.countOpenIncidents().catch(() => null),
        this.resourceAssetContext.getDeviceConnectivity().catch(() => null),
      ]);
      this.notificationsState.set(notifications);
      this.registrations.set(registrations);
      this.openIncidents.set(openIncidents);
      this.devices.set(devices);
      this.status.set('loaded');
      this.ready.set(true);
    } catch (error) {
      this.status.set('error');
      throw error;
    }
  }

  // ---------- Commands ----------
  async markAllAsRead(): Promise<void> {
    const unread = this.notificationsState().filter((n) => !n.read);
    if (unread.length === 0) return;
    const updated = unread.map((n) => n.markAsRead());
    await this.repository.saveNotifications(updated);
    const byId = new Map(updated.map((n) => [n.id, n]));
    this.notificationsState.update((all) => all.map((n) => byId.get(n.id) ?? n));
  }

  private periodConsumption(utility: UtilityType): PeriodConsumption | null {
    const period = this.currentPeriod();
    if (!period) return null;
    const ofUtility = this.registrations().filter((r) => r.utilityType === utility);
    const current = ofUtility.filter((r) => r.period === period);
    if (current.length === 0) return null;
    const previousPeriod = [...new Set(ofUtility.map((r) => r.period))]
      .filter((p) => p < period)
      .sort()
      .at(-1);
    const total = (records: ConsumptionRegistration[]) =>
      records.reduce((sum, r) => sum + r.value.amount, 0);
    const previous = previousPeriod ? ofUtility.filter((r) => r.period === previousPeriod) : [];
    return new PeriodConsumption(
      utility,
      period,
      total(current),
      previous.length ? total(previous) : null,
      current[0].value.unit,
    );
  }
}
