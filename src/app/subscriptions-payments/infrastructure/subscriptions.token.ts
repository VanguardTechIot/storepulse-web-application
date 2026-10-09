import { InjectionToken } from '@angular/core';
import { SubscriptionsRepository } from '../domain/repository/subscriptions.repository';
import { MockSubscriptionsRepository } from './mock/mock-subscriptions.repository';

/**
 * Single injection point of the repository.
 * It answers with in-memory data today; when the fake API (or the REST API) is ready, swap the
 * factory for the HTTP implementation and nothing else changes.
 */
export const SUBSCRIPTIONS_REPOSITORY = new InjectionToken<SubscriptionsRepository>(
  'SUBSCRIPTIONS_REPOSITORY',
  {
    providedIn: 'root',
    factory: () => new MockSubscriptionsRepository(),
  },
);
