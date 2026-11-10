/**
 * Business outcomes that prevent an analytics operation from completing.
 * The value doubles as the i18n key suffix (`analytics.errors.<code>`).
 */
export enum AnalyticsErrorCode {
  InvalidConsumptionValue = 'invalid_consumption_value',
  AlertNotFound = 'alert_not_found',
  AlertCannotBeAcknowledged = 'alert_cannot_be_acknowledged',
  AlertCannotBeResolved = 'alert_cannot_be_resolved',
  InvalidResolutionNote = 'invalid_resolution_note',
  AccessDenied = 'access_denied',
  Network = 'network',
  Unexpected = 'unexpected',
}

export class AnalyticsError extends Error {
  constructor(readonly code: AnalyticsErrorCode) {
    super(code);
    this.name = 'AnalyticsError';
  }
}
