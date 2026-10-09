import { InjectionToken } from '@angular/core';
import { AnalyticsRepository } from '../domain/repository/analytics.repository';
import { MockAnalyticsRepository } from './mock/mock-analytics.repository';

/**
 * Single injection point of the repository.
 * It answers with in-memory data today; when the fake API (or the REST API) is ready, swap the
 * factory for the HTTP implementation and nothing else changes.
 */
export const ANALYTICS_REPOSITORY = new InjectionToken<AnalyticsRepository>(
  'ANALYTICS_REPOSITORY',
  {
    providedIn: 'root',
    factory: () => new MockAnalyticsRepository(),
  },
);
