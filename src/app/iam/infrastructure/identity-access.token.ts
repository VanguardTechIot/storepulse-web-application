import { InjectionToken } from '@angular/core';
import { IamRepository } from '../domain/repository/iam.repository';
import { HttpIamRepository } from './http/http-iam.repository';

/**
 * Injection token for the IAM repository.
 *
 * Currently uses the local data server implementation. Replace the provider here to use the
 * production REST API implementation.
 */
export const IDENTITY_ACCESS_REPOSITORY = new InjectionToken<IamRepository>(
  'IDENTITY_ACCESS_REPOSITORY',
  {
    providedIn: 'root',
    factory: () => new HttpIamRepository(),
  },
);
