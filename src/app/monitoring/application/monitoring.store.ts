import { computed, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { MonitoringApi } from '../infrastructure/monitoring-api';
import { RESOURCE_ASSET_REPOSITORY } from '../../resource-asset-management/infrastructure/resource-asset.token';
import { MonitoredResource } from '../domain/model/monitored-resource';
import { Telemetry } from '../domain/model/telemetry.entity';
import { Measurement } from '../domain/model/measurement.entity';
import { Consumption } from '../domain/model/consumption.entity';
import { ConsumptionType, MEASUREMENT_TYPES, MeasurementType } from '../domain/model/measurement-type';

/** Security state of a resource (US-19). */
export type ResourceMonitoringState = 'NORMAL' | 'MOTION_DETECTED' | 'NO_MONITORING';

export interface ResourceMonitoringStatus {
  resource: MonitoredResource;
  state: ResourceMonitoringState;
  lastTelemetryAt: Date | null;
  latest: Partial<Record<MeasurementType, Measurement>>;
}

export interface MeasurementRow {
  measurement: Measurement;
  resource: MonitoredResource | null;
}

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
  readonly consumption = signal<Consumption[]>([]);

  // ---------- Lookups ----------
  private readonly telemetryById = computed(() => new Map(this.telemetry().map((t) => [t.id, t])));
  private readonly resourceByDeviceId = computed(
    () => new Map(this.resources().filter((r) => r.deviceId).map((r) => [r.deviceId as string, r])),
  );

  // ---------- Telemetry ----------
  readonly measurementRows = computed<MeasurementRow[]>(() =>
    this.telemetry()
      .flatMap((t) => t.measurements)
      .map((measurement) => ({ measurement, resource: this.resourceOfMeasurement(measurement) }))
      .sort((a, b) => b.measurement.recordedAt.getTime() - a.measurement.recordedAt.getTime()),
  );

  readonly resourceStatuses = computed<ResourceMonitoringStatus[]>(() =>
    this.resources().map((resource) => {
      const deviceTelemetry = this.telemetry()
        .filter((t) => t.deviceId === resource.deviceId)
        .sort((a, b) => b.receivedAt.getTime() - a.receivedAt.getTime());
      const latest: Partial<Record<MeasurementType, Measurement>> = {};
      for (const t of deviceTelemetry) {
        for (const m of t.measurements) latest[m.type] ??= m;
      }
      const state: ResourceMonitoringState = !resource.monitoringAvailable
        ? 'NO_MONITORING'
        : latest.MOTION?.value === 1
          ? 'MOTION_DETECTED'
          : 'NORMAL';
      return { resource, state, lastTelemetryAt: deviceTelemetry[0]?.receivedAt ?? null, latest };
    }),
  );

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
      const [resources, telemetry, consumption] = await Promise.all([
        this.loadMonitoredResources(),
        firstValueFrom(this.monitoringApi.getTelemetry()),
        firstValueFrom(this.monitoringApi.getConsumption()),
      ]);
      this.resources.set(resources);
      this.telemetry.set(telemetry);
      this.consumption.set(consumption);
      this.status.set('loaded');
      this.ready.set(true);
    } catch (error) {
      this.status.set('error');
      throw error;
    }
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

  private resourceOfMeasurement(measurement: Measurement): MonitoredResource | null {
    const telemetry = this.telemetryById().get(measurement.telemetryId);
    return telemetry ? (this.resourceByDeviceId().get(telemetry.deviceId) ?? null) : null;
  }
}
