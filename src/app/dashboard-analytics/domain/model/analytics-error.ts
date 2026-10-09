/**
 * Business outcomes that prevent an analytics operation from completing.
 * The value doubles as the i18n key suffix (`analytics.errors.<code>`).
 */
export enum AnalyticsErrorCode {
  InvalidConsumptionValue = 'invalid_consumption_value',
  NotificationNotFound = 'notification_not_found',
  Unexpected = 'unexpected',
}

export class AnalyticsError extends Error {
  constructor(readonly code: AnalyticsErrorCode) {
    super(code);
    this.name = 'AnalyticsError';
  }
}
