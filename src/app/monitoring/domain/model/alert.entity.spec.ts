import { Alert, AlertTransitionError } from './alert.entity';

const detectedAt = new Date('2026-10-08T09:00:09Z');
const activeAlert = () => new Alert('alr-1', 'rul-1', 'msr-1', 'ACTIVE', detectedAt, null, null, null);

describe('Alert', () => {
  it('moves from ACTIVE to ACKNOWLEDGED and records the acknowledgement time', () => {
    const acknowledgedAt = new Date('2026-10-08T09:02:09Z');
    const alert = activeAlert().acknowledge(acknowledgedAt);

    expect(alert.status).toBe('ACKNOWLEDGED');
    expect(alert.acknowledgedAt).toEqual(acknowledgedAt);
    expect(alert.responseTimeMs).toBe(120_000);
  });

  it('moves from ACKNOWLEDGED to RESOLVED keeping the time to acknowledge', () => {
    const alert = activeAlert()
      .acknowledge(new Date('2026-10-08T09:01:09Z'))
      .resolve('  Sensor verified  ', new Date('2026-10-08T09:30:00Z'));

    expect(alert.status).toBe('RESOLVED');
    expect(alert.resolutionNote).toBe('Sensor verified');
    expect(alert.responseTimeMs).toBe(60_000);
  });

  it('cannot be resolved before being acknowledged', () => {
    expect(() => activeAlert().resolve('note')).toThrow(AlertTransitionError);
  });

  it('keeps a resolved alert unchanged when acknowledging again', () => {
    const resolved = activeAlert().acknowledge().resolve('note');

    expect(resolved.canAcknowledge).toBe(false);
    expect(() => resolved.acknowledge()).toThrow(AlertTransitionError);
  });
});
