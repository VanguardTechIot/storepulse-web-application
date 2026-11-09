import { computed, inject, Injectable, signal } from '@angular/core';
import { runCommand } from '../../shared/application/run-command';
import { AlertStatus } from '../domain/enums/alert-status.enum';
import { Alert } from '../domain/model/alert.entity';
import { AnalyticsError, AnalyticsErrorCode } from '../domain/model/analytics-error';
import { DashboardSummary } from '../domain/model/dashboard-summary';
import { DeviceConnectivitySummary } from '../domain/model/device-connectivity-summary';
import { ResourceAssetContextFacade } from '../infrastructure/acl/resource-asset-context-facade';
import { ANALYTICS_REPOSITORY } from '../infrastructure/repositories/analytics.token';

type LoadStatus = 'idle' | 'loading' | 'loaded' | 'error';

/**
 * Application service of Dashboard and Analytics for the Web Application: Consolidated Dashboard
 * and Alert Center.
 *
 * Commands resolve to `true` when they succeed; on failure they resolve to `false` and expose the
 * reason in `error` (an `AnalyticsErrorCode`, translated as `analytics.errors.<code>`).
 */
@Injectable({ providedIn: 'root' })
export class AnalyticsStore {
  private readonly repository = inject(ANALYTICS_REPOSITORY);
  private readonly resourceAssetContext = inject(ResourceAssetContextFacade);

  private readonly status = signal<LoadStatus>('idle');
  /** True once the data has been loaded at least once; later refreshes keep showing it. */
  readonly ready = signal(false);
  readonly isLoading = computed(() => this.status() === 'loading' || this.status() === 'idle');
  readonly hasError = computed(() => this.status() === 'error');
  readonly processing = signal(false);
  readonly error = signal<AnalyticsErrorCode | null>(null);

  private readonly summaryState = signal<DashboardSummary | null>(null);
  private readonly alertsState = signal<Alert[]>([]);
  private readonly devicesState = signal<DeviceConnectivitySummary | null>(null);

  readonly summary = this.summaryState.asReadonly();
  readonly alerts = this.alertsState.asReadonly();
  readonly devices = this.devicesState.asReadonly();
  readonly devicesRoute = this.resourceAssetContext.devicesRoute;

  readonly openAlerts = computed(() => this.alertsState().filter((alert) => alert.isOpen));

  countByStatus(status: AlertStatus | null): number {
    return this.alertsState().filter((alert) => status === null || alert.status === status).length;
  }

  // ---------- Queries ----------
  /** Loads the summary and the alerts. Rejects when the platform cannot be reached. */
  async load(force = false): Promise<void> {
    if (!force && (this.status() === 'loaded' || this.status() === 'loading')) return;
    this.status.set('loading');
    try {
      const [summary, alerts, devices] = await Promise.all([
        this.repository.getSummary(),
        this.repository.listAlerts(),
        // An indicator without data is shown as empty instead of failing the whole dashboard.
        this.resourceAssetContext.getDeviceConnectivity().catch(() => null),
      ]);
      this.summaryState.set(summary);
      this.alertsState.set(alerts);
      this.devicesState.set(devices);
      this.status.set('loaded');
      this.ready.set(true);
    } catch (error) {
      this.status.set('error');
      throw error;
    }
  }

  // ---------- Commands ----------
  acknowledge(alert: Alert): Promise<boolean> {
    return this.execute(async () => {
      alert.acknowledge();
      await this.replace(await this.repository.acknowledgeAlert(alert.id));
    });
  }

  resolve(alert: Alert, resolutionNote: string): Promise<boolean> {
    return this.execute(async () => {
      const resolved = alert.resolve(resolutionNote);
      await this.replace(
        await this.repository.resolveAlert(alert.id, resolved.resolutionNote ?? ''),
      );
    });
  }

  clearError(): void {
    this.error.set(null);
  }

  /** Swaps the updated alert and refreshes the counters of the summary. */
  private async replace(updated: Alert): Promise<void> {
    this.alertsState.update((all) => all.map((a) => (a.id === updated.id ? updated : a)));
    this.summaryState.set(await this.repository.getSummary());
  }

  private async execute(command: () => Promise<void>): Promise<boolean> {
    const toCode = (failure: unknown) =>
      failure instanceof AnalyticsError ? failure.code : AnalyticsErrorCode.Unexpected;
    return (await runCommand(this.processing, this.error, toCode, command)) !== null;
  }
}
