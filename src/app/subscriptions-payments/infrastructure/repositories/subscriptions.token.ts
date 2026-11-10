import { InjectionToken } from '@angular/core';
import { SubscriptionsRepository } from '../../domain/repositories/subscriptions.repository';
import { HttpSubscriptionsRepository } from './http-subscriptions.repository';

/** Single injection point of the repository, implemented over the StorePulse REST API. */
export const SUBSCRIPTIONS_REPOSITORY = new InjectionToken<SubscriptionsRepository>(
  'SUBSCRIPTIONS_REPOSITORY',
  {
    providedIn: 'root',
    factory: () => new HttpSubscriptionsRepository(),
  },
);
