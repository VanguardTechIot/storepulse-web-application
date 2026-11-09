import { InjectionToken } from '@angular/core';
import { UtilityBillingRepository } from '../../domain/repositories/utility-billing.repository';
import { HttpUtilityBillingRepository } from './http-utility-billing.repository';

/** Single injection point of the repository, implemented over the StorePulse REST API. */
export const UTILITY_BILLING_REPOSITORY = new InjectionToken<UtilityBillingRepository>(
  'UTILITY_BILLING_REPOSITORY',
  {
    providedIn: 'root',
    factory: () => new HttpUtilityBillingRepository(),
  },
);
