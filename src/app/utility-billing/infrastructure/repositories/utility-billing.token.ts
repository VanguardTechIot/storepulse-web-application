import { InjectionToken } from '@angular/core';
import { UtilityBillingRepository } from '../../domain/repositories/utility-billing.repository';
import { HttpUtilityBillingRepository } from './http-utility-billing.repository';

/**
 * Single injection point of the repository.
 * It points to the platform API (json-server) today; with the real REST API, swap the
 * implementation here and nothing else changes.
 */
export const UTILITY_BILLING_REPOSITORY = new InjectionToken<UtilityBillingRepository>(
  'UTILITY_BILLING_REPOSITORY',
  {
    providedIn: 'root',
    factory: () => new HttpUtilityBillingRepository(),
  },
);
