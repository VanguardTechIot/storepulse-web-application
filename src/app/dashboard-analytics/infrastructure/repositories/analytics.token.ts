import { InjectionToken } from '@angular/core';
import { AnalyticsRepository } from '../../domain/repositories/analytics.repository';
import { HttpAnalyticsRepository } from './http-analytics.repository';

/**
 * Single injection point of the repository.
 * It points to the platform API (json-server) today; with the real REST API, swap the
 * implementation here and nothing else changes.
 */
export const ANALYTICS_REPOSITORY = new InjectionToken<AnalyticsRepository>(
  'ANALYTICS_REPOSITORY',
  {
    providedIn: 'root',
    factory: () => new HttpAnalyticsRepository(),
  },
);
