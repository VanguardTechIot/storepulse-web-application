/**
 * Business outcomes that prevent a billing operation from completing.
 * The value doubles as the i18n key suffix (`billing.errors.<code>`).
 */
export enum BillingErrorCode {
  NotFound = 'not_found',
  UnitNotFound = 'unit_not_found',
  Duplicate = 'duplicate',
  InvalidTransition = 'invalid_transition',
  IncompleteDataNotAccepted = 'incomplete_data_not_accepted',
  DisputeClosed = 'dispute_closed',
  ResolutionRequired = 'resolution_required',
  InvalidAmount = 'invalid_amount',
  InvalidPeriod = 'invalid_period',
  InvalidBill = 'invalid_bill',
  TariffNotFound = 'tariff_not_found',
  NoConsumptionData = 'no_consumption_data',
  TenantRequired = 'tenant_required',
  TextTooLong = 'text_too_long',
  Network = 'network',
  Unexpected = 'unexpected',
}

export class BillingError extends Error {
  constructor(readonly code: BillingErrorCode) {
    super(code);
    this.name = 'BillingError';
  }
}
