import { NotificationType } from './notification-type.enum';
import { Notification } from './notification.entity';
import { groupRepeatedNotifications } from './notification-grouping';

describe('groupRepeatedNotifications', () => {
  const at = (minute: number) => new Date(Date.UTC(2026, 9, 8, 22, minute));
  const intrusion = (id: string, minute: number, device = 'dev-b12') =>
    new Notification(
      id,
      NotificationType.SafetyAlert,
      device,
      'Local B-12',
      'Intrusión',
      at(minute),
    );

  it('groups more than 3 events of the same type and device within 5 minutes (TS-30, scenario 2)', () => {
    const result = groupRepeatedNotifications([
      intrusion('n1', 0),
      intrusion('n2', 1),
      intrusion('n3', 2),
      intrusion('n4', 4),
    ]);

    expect(result).toHaveLength(1);
    expect(result[0].occurrences).toBe(4);
    expect(result[0].id).toBe('n4');
  });

  it('keeps up to 3 repeated events as separate notifications', () => {
    const result = groupRepeatedNotifications([
      intrusion('n1', 0),
      intrusion('n2', 1),
      intrusion('n3', 2),
    ]);

    expect(result.map((n) => n.id)).toEqual(['n3', 'n2', 'n1']);
  });

  it('does not group events of different devices or outside the window', () => {
    const result = groupRepeatedNotifications([
      intrusion('n1', 0),
      intrusion('n2', 1, 'dev-c07'),
      intrusion('n3', 2),
      intrusion('n4', 9),
    ]);

    expect(result).toHaveLength(4);
  });
});
