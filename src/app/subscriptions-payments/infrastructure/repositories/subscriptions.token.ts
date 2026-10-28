import { InjectionToken } from '@angular/core';
import { SubscriptionsRepository } from '../../domain/repositories/subscriptions.repository';
import { HttpSubscriptionsRepository } from './http-subscriptions.repository';

/**
 * Single injection point of the repository.
 * It points to the platform API (json-server) today; with the real REST API, swap the
 * implementation here and nothing else changes.
 */
export const SUBSCRIPTIONS_REPOSITORY = new InjectionToken<SubscriptionsRepository>(
  'SUBSCRIPTIONS_REPOSITORY',
  {
    providedIn: 'root',
    factory: () => new HttpSubscriptionsRepository(),
  },
);
