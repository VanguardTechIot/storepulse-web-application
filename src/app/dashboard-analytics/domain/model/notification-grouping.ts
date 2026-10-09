import { Notification } from './notification.entity';

/** TS-30, scenario 2: more than 3 events of the same type and device within 5 minutes. */
export const GROUPING_WINDOW_MS = 5 * 60 * 1000;
export const GROUPING_MIN_EVENTS = 4;

/**
 * Domain service: collapses repeated notifications into one that states how many events it
 * represents. Returns the notifications from the most recent to the oldest.
 */
export function groupRepeatedNotifications(notifications: readonly Notification[]): Notification[] {
  const chronological = [...notifications].sort(
    (a, b) => a.generatedAt.getTime() - b.generatedAt.getTime(),
  );
  const bursts: Notification[][] = [];
  for (const notification of chronological) {
    const burst = bursts.find(
      (candidate) =>
        candidate[0].isRepetitionOf(notification) &&
        notification.generatedAt.getTime() - candidate[0].generatedAt.getTime() <=
          GROUPING_WINDOW_MS,
    );
    if (burst) burst.push(notification);
    else bursts.push([notification]);
  }

  return bursts
    .flatMap((burst) => {
      if (burst.length < GROUPING_MIN_EVENTS) return burst;
      const latest = burst[burst.length - 1];
      return [
        new Notification(
          latest.id,
          latest.type,
          latest.relatedEntityId,
          latest.location,
          latest.message,
          latest.generatedAt,
          burst.every((n) => n.read),
          burst.reduce((sum, n) => sum + n.occurrences, 0),
        ),
      ];
    })
    .sort((a, b) => b.generatedAt.getTime() - a.generatedAt.getTime());
}
