import { AlertStatus } from '../enums/alert-status.enum';
import { SensorType } from '../enums/sensor-type.enum';
import { Alert } from './alert.entity';
import { AnalyticsErrorCode } from './analytics-error';

describe('Alert', () => {
  const active = Alert.restore({
    id: '1',
    deviceId: '1',
    sensorType: SensorType.Smoke,
    measuredValue: 420,
    status: AlertStatus.Active,
    detectedAt: new Date('2026-11-06T16:10:00Z'),
    acknowledgedAt: null,
    resolvedAt: null,
    resolutionNote: null,
  });

  it('is acknowledged and then resolved with a note', () => {
    const at = new Date('2026-11-06T16:20:00Z');
    const resolved = active.acknowledge(at).resolve('  Smoke from the kitchen  ', at);

    expect(resolved.status).toBe(AlertStatus.Resolved);
    expect(resolved.isOpen).toBe(false);
    expect(resolved.acknowledgedAt).toEqual(at);
    expect(resolved.resolutionNote).toBe('Smoke from the kitchen');
  });

  it('cannot skip the acknowledgement or be acknowledged twice', () => {
    expect(() => active.resolve('Checked')).toThrow(AnalyticsErrorCode.AlertCannotBeResolved);
    expect(() => active.acknowledge().acknowledge()).toThrow(
      AnalyticsErrorCode.AlertCannotBeAcknowledged,
    );
  });

  it('requires a resolution note of at most 255 characters', () => {
    const acknowledged = active.acknowledge();

    expect(() => acknowledged.resolve('   ')).toThrow(AnalyticsErrorCode.InvalidResolutionNote);
    expect(() => acknowledged.resolve('x'.repeat(256))).toThrow(
      AnalyticsErrorCode.InvalidResolutionNote,
    );
  });
});
