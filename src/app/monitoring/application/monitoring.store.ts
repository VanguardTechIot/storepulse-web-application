import { computed, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { MonitoringApi } from '../infrastructure/monitoring-api';
import { RESOURCE_ASSET_REPOSITORY } from '../../resource-asset-management/infrastructure/resource-asset.token';
import { MonitoredResource } from '../domain/model/monitored-resource';
import { Telemetry } from '../domain/model/telemetry.entity';
import { Measurement } from '../domain/model/measurement.entity';
import { MonitoringRule } from '../domain/model/monitoring-rule.entity';
import { Alert } from '../domain/model/alert.entity';
import { Consumption } from '../domain/model/consumption.entity';
import { ConsumptionType, MEASUREMENT_TYPES, MeasurementType } from '../domain/model/measurement-type';

/** Alert joined with the rule, measurement and location that produced it. */
export interface AlertDetails {
  alert: Alert;
  rule: MonitoringRule | null;
  measurement: Measurement | null;
  resource: MonitoredResource | null;
}

/** Security state of a resource (US-19). */
export type ResourceMonitoringState = 'NORMAL' | 'OPEN_ALERT' | 'NO_MONITORING';

export interface ResourceMonitoringStatus {
  resource: MonitoredResource;
  state: ResourceMonitoringState;
  openAlerts: number;
  lastTelemetryAt: Date | null;
  latest: Partial<Record<MeasurementType, Measurement>>;
}

export interface MeasurementRow {
  measurement: Measurement;
  resource: MonitoredResource | null;
  /** Enabled rule whose threshold the measurement meets, if any. */
  matchedRule: MonitoringRule | null;
}

/** Result of a lifecycle action when the alert changed elsewhere in the meantime. */
export type AlertActionOutcome = 'updated' | 'unchanged';

type LoadStatus = 'idle' | 'loading' | 'loaded' | 'error';

/**
 * Application service of Service Execution and Monitoring for the Web Application.
 */
@Injectable({ providedIn: 'root' })
export class MonitoringStore {
  private readonly monitoringApi = inject(MonitoringApi);
  private readonly resourceAssetRepository = inject(RESOURCE_ASSET_REPOSITORY);

  private readonly status = signal<LoadStatus>('idle');
  /** True once the data has been loaded at least once; later refreshes keep showing it. */
  readonly ready = signal(false);
  readonly isLoading = computed(() => this.status() === 'loading' || this.status() === 'idle');
  readonly hasError = computed(() => this.status() === 'error');

  readonly resources = signal<MonitoredResource[]>([]);
  readonly telemetry = signal<Telemetry[]>([]);
  readonly rules = signal<MonitoringRule[]>([]);
  readonly alerts = signal<Alert[]>([]);
  readonly consumption = signal<Consumption[]>([]);

  // ---------- Lookups ----------
  private readonly measurementById = computed(
    () => new Map(this.telemetry().flatMap((t) => t.measurements).map((m) => [m.id, m])),
  );
  private readonly telemetryById = computed(() => new Map(this.telemetry().map((t) => [t.id, t])));
  private readonly resourceByDeviceId = computed(
    () => new Map(this.resources().filter((r) => r.deviceId).map((r) => [r.deviceId as string, r])),
  );
  private readonly ruleById = computed(() => new Map(this.rules().map((r) => [r.id, r])));

  // ---------- Alerts ----------
  readonly alertDetails = computed<AlertDetails[]>(() =>
    this.alerts()
      .map((alert) => {
        const measurement = this.measurementById().get(alert.measurementId) ?? null;
        return {
          alert,
          rule: this.ruleById().get(alert.ruleId) ?? null,
          measurement,
          resource: measurement ? this.resourceOfMeasurement(measurement) : null,
        };
      })
      .sort((a, b) => b.alert.createdAt.getTime() - a.alert.createdAt.getTime()),
  );

  readonly activeAlertCount = computed(() => this.alerts().filter((a) => a.status === 'ACTIVE').length);
  readonly acknowledgedAlertCount = computed(() => this.alerts().filter((a) => a.status === 'ACKNOWLEDGED').length);
  readonly lastAlert = computed(() => this.alertDetails()[0] ?? null);

  // ---------- Telemetry ----------
  readonly measurementRows = computed<MeasurementRow[]>(() => {
    const enabledRules = this.rules().filter((rule) => rule.enabled);
    return this.telemetry()
      .flatMap((t) => t.measurements)
      .map((measurement) => ({
        measurement,
        resource: this.resourceOfMeasurement(measurement),
        matchedRule: enabledRules.find((rule) => rule.evaluate(measurement)) ?? null,
      }))
      .sort((a, b) => b.measurement.recordedAt.getTime() - a.measurement.recordedAt.getTime());
  });

  readonly resourceStatuses = computed<ResourceMonitoringStatus[]>(() => {
    const openAlertsByResource = new Map<string, number>();
    for (const details of this.alertDetails()) {
      if (details.alert.isOpen && details.resource) {
        const id = details.resource.resourceId;
        openAlertsByResource.set(id, (openAlertsByResource.get(id) ?? 0) + 1);
      }
    }
    return this.resources().map((resource) => {
      const deviceTelemetry = this.telemetry()
        .filter((t) => t.deviceId === resource.deviceId)
        .sort((a, b) => b.receivedAt.getTime() - a.receivedAt.getTime());
      const latest: Partial<Record<MeasurementType, Measurement>> = {};
      for (const t of deviceTelemetry) {
        for (const m of t.measurements) latest[m.type] ??= m;
      }
      const openAlerts = openAlertsByResource.get(resource.resourceId) ?? 0;
      const state: ResourceMonitoringState = !resource.monitoringAvailable
        ? 'NO_MONITORING'
        : openAlerts > 0
          ? 'OPEN_ALERT'
          : 'NORMAL';
      return { resource, state, openAlerts, lastTelemetryAt: deviceTelemetry[0]?.receivedAt ?? null, latest };
    });
  });

  // ---------- Consumption ----------
  /** Periods (YYYY-MM) with consumption records, most recent first. */
  readonly consumptionPeriods = computed(() =>
    [...new Set(this.consumption().map((c) => c.periodKey))].sort().reverse(),
  );

  consumptionHistory(resourceId: string, type: ConsumptionType): Consumption[] {
    return this.consumption()
      .filter((c) => c.resourceId === resourceId && c.measurementType === type)
      .sort((a, b) => a.periodKey.localeCompare(b.periodKey));
  }

  // ---------- Queries ----------
  /** Loads every monitoring query. Rejects when the data source cannot be reached. */
  async load(force = false): Promise<void> {
    if (!force && (this.status() === 'loaded' || this.status() === 'loading')) return;
    this.status.set('loading');
    try {
      const [resources, telemetry, rules, alerts, consumption] = await Promise.all([
        this.loadMonitoredResources(),
        firstValueFrom(this.monitoringApi.getTelemetry()),
        firstValueFrom(this.monitoringApi.getMonitoringRules()),
        firstValueFrom(this.monitoringApi.getAlerts()),
        firstValueFrom(this.monitoringApi.getConsumption()),
      ]);
      this.resources.set(resources);
      this.telemetry.set(telemetry);
      this.rules.set(rules);
      this.alerts.set(alerts);
      this.consumption.set(consumption);
      this.status.set('loaded');
      this.ready.set(true);
    } catch (error) {
      this.status.set('error');
      throw error;
    }
  }

  findAlertDetails(id: string): AlertDetails | null {
    return this.alertDetails().find((details) => details.alert.id === id) ?? null;
  }

  // ---------- Commands ----------
  /**
   * ACTIVE → ACKNOWLEDGED. The latest state is read first so an alert already attended
   * elsewhere keeps its status and recorded times (US-53, scenario 3).
   */
  async acknowledgeAlert(id: string): Promise<AlertActionOutcome> {
    const current = await this.refreshAlert(id);
    if (!current.canAcknowledge) return 'unchanged';
    const updated = current.acknowledge();
    await firstValueFrom(this.monitoringApi.updateAlert(updated));
    this.replaceAlert(updated);
    return 'updated';
  }

  /** ACKNOWLEDGED → RESOLVED, recording the result of the attention. */
  async resolveAlert(id: string, resolutionNote: string): Promise<AlertActionOutcome> {
    const current = await this.refreshAlert(id);
    if (!current.canResolve) return 'unchanged';
    const updated = current.resolve(resolutionNote);
    await firstValueFrom(this.monitoringApi.updateAlert(updated));
    this.replaceAlert(updated);
    return 'updated';
  }

  async setRuleEnabled(id: string, enabled: boolean): Promise<void> {
    const rule = this.ruleById().get(id);
    if (!rule || rule.enabled === enabled) return;
    const updated = enabled ? rule.enable() : rule.disable();
    await firstValueFrom(this.monitoringApi.updateMonitoringRule(updated));
    this.rules.update((rules) => rules.map((r) => (r.id === updated.id ? updated : r)));
  }

  private async refreshAlert(id: string): Promise<Alert> {
    const latest = await firstValueFrom(this.monitoringApi.getAlertById(id));
    this.replaceAlert(latest);
    return latest;
  }

  private async loadMonitoredResources(): Promise<MonitoredResource[]> {
    const [resources, assets, devices, sensors, meters] = await Promise.all([
      this.resourceAssetRepository.listResources(),
      this.resourceAssetRepository.listAssets(),
      this.resourceAssetRepository.listIoTDevices(),
      this.resourceAssetRepository.listSensors(),
      this.resourceAssetRepository.listMeters(),
    ]);
    return resources.map((resource) => {
      const asset = assets.find((a) => a.resourceId === resource.id && a.type === 'IOT_DEVICE');
      const device = asset ? devices.find((d) => d.assetId === asset.id) : undefined;
      const activeTypes = new Set<MeasurementType>(
        [...sensors, ...meters]
          .filter(
            (component) => component.iotDeviceId === device?.id && component.status === 'ACTIVE',
          )
          .map((component) => component.type)
          .filter((type): type is MeasurementType =>
            MEASUREMENT_TYPES.includes(type as MeasurementType),
          ),
      );
      return {
        resourceId: resource.id,
        name: resource.name,
        description: resource.description,
        floor: resource.location.floor,
        reference: resource.location.reference,
        deviceId: device?.id ?? null,
        deviceSerialNumber: device?.serialNumber ?? null,
        monitoringAvailable: resource.isActive && !!device?.isActive,
        monitoredTypes: MEASUREMENT_TYPES.filter((type) => activeTypes.has(type)),
      };
    });
  }

  private replaceAlert(alert: Alert): void {
    this.alerts.update((alerts) => alerts.map((a) => (a.id === alert.id ? alert : a)));
  }

  private resourceOfMeasurement(measurement: Measurement): MonitoredResource | null {
    const telemetry = this.telemetryById().get(measurement.telemetryId);
    return telemetry ? (this.resourceByDeviceId().get(telemetry.deviceId) ?? null) : null;
  }
}
