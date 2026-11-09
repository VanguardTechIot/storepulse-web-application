import { InjectionToken } from '@angular/core';
import { AnalyticsRepository } from '../../domain/repositories/analytics.repository';
import { HttpAnalyticsRepository } from './http-analytics.repository';

/** Single injection point of the repository, implemented over the StorePulse REST API. */
export const ANALYTICS_REPOSITORY = new InjectionToken<AnalyticsRepository>(
  'ANALYTICS_REPOSITORY',
  {
    providedIn: 'root',
    factory: () => new HttpAnalyticsRepository(),
  },
);
