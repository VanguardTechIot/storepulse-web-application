import { InjectionToken } from '@angular/core';
import { UtilityBillingRepository } from '../domain/repository/utility-billing.repository';
import { MockUtilityBillingRepository } from './mock/mock-utility-billing.repository';

/**
 * Punto único de inyección del repositorio.
 * Cuando exista el backend, cambia la factory por la implementación HTTP.
 */
export const UTILITY_BILLING_REPOSITORY = new InjectionToken<UtilityBillingRepository>(
  'UTILITY_BILLING_REPOSITORY',
  {
    providedIn: 'root',
    factory: () => new MockUtilityBillingRepository(),
  },
);
