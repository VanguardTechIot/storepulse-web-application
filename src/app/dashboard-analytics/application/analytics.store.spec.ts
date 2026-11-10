import { TestBed } from '@angular/core/testing';
import { AlertStatus } from '../domain/enums/alert-status.enum';
import { SensorType } from '../domain/enums/sensor-type.enum';
import { Alert } from '../domain/model/alert.entity';
import { AnalyticsError, AnalyticsErrorCode } from '../domain/model/analytics-error';
import { DashboardSummary } from '../domain/model/dashboard-summary';
import { AnalyticsRepository } from '../domain/repositories/analytics.repository';
import { ConsumptionValue } from '../domain/value-objects/consumption-value.value-object';
import { ResourceAssetContextFacade } from '../infrastructure/acl/resource-asset-context-facade';
import { ANALYTICS_REPOSITORY } from '../infrastructure/repositories/analytics.token';
import { AnalyticsStore } from './analytics.store';

describe('AnalyticsStore', () => {
  const alert = (id: string, status: AlertStatus) =>
    Alert.restore({
      id,
      deviceId: '1',
      sensorType: SensorType.Smoke,
      measuredValue: 420,
      status,
      detectedAt: new Date('2026-11-06T16:10:00Z'),
      acknowledgedAt: null,
      resolvedAt: null,
      resolutionNote: null,
    });
  const summary = (open: number) =>
    new DashboardSummary(
      { open, active: open, acknowledged: 0, resolved: 0, openBySensorType: { SMOKE: open } },
      new ConsumptionValue(1250, 'kWh'),
      new ConsumptionValue(48, 'm³'),
    );

  let repository: { [K in keyof AnalyticsRepository]: ReturnType<typeof vi.fn> };
  let devices: { devicesRoute: string[]; getDeviceConnectivity: ReturnType<typeof vi.fn> };
  let store: AnalyticsStore;

  beforeEach(() => {
    repository = {
      getSummary: vi.fn(async () => summary(2)),
      listAlerts: vi.fn(async () => [
        alert('1', AlertStatus.Active),
        alert('2', AlertStatus.Resolved),
      ]),
      acknowledgeAlert: vi.fn(async () => alert('1', AlertStatus.Acknowledged)),
      resolveAlert: vi.fn(),
    };
    devices = {
      devicesRoute: [],
      getDeviceConnectivity: vi.fn(async () => ({ total: 8, disconnected: 1 })),
    };
    TestBed.configureTestingModule({
      providers: [
        { provide: ANALYTICS_REPOSITORY, useValue: repository },
        { provide: ResourceAssetContextFacade, useValue: devices },
      ],
    });
    store = TestBed.inject(AnalyticsStore);
  });

  it('loads the summary, the alerts and the device connectivity', async () => {
    await store.load();

    expect(store.ready()).toBe(true);
    expect(store.summary()?.alerts.open).toBe(2);
    expect(store.openAlerts().map((a) => a.id)).toEqual(['1']);
    expect(store.countByStatus(AlertStatus.Resolved)).toBe(1);
    expect(store.devices()?.disconnected).toBe(1);
  });

  it('shows the devices indicator as empty when its source fails', async () => {
    devices.getDeviceConnectivity.mockRejectedValue(new Error('offline'));

    await store.load();

    expect(store.hasError()).toBe(false);
    expect(store.devices()).toBeNull();
  });

  it('marks the dashboard as failed when its own data cannot be loaded', async () => {
    repository.getSummary.mockRejectedValue(new AnalyticsError(AnalyticsErrorCode.Network));

    await expect(store.load()).rejects.toThrow(AnalyticsError);
    expect(store.hasError()).toBe(true);
  });

  it('acknowledges an alert and refreshes the summary', async () => {
    await store.load();
    repository.getSummary.mockResolvedValue(summary(1));

    const done = await store.acknowledge(store.alerts()[0]);

    expect(done).toBe(true);
    expect(repository.acknowledgeAlert).toHaveBeenCalledWith('1');
    expect(store.alerts()[0].status).toBe(AlertStatus.Acknowledged);
    expect(store.summary()?.alerts.open).toBe(1);
  });

  it('does not call the platform when the alert cannot be resolved yet', async () => {
    await store.load();

    const done = await store.resolve(store.alerts()[0], 'Checked');

    expect(done).toBe(false);
    expect(store.error()).toBe(AnalyticsErrorCode.AlertCannotBeResolved);
    expect(repository.resolveAlert).not.toHaveBeenCalled();
  });
});
