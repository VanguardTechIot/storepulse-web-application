import { InjectionToken } from '@angular/core';
import { IamRepository } from '../domain/repository/iam.repository';
import { HttpIamRepository } from './http/http-iam.repository';

/**
 * Injection token for the IAM repository, implemented over the StorePulse REST API.
 */
export const IDENTITY_ACCESS_REPOSITORY = new InjectionToken<IamRepository>(
  'IDENTITY_ACCESS_REPOSITORY',
  {
    providedIn: 'root',
    factory: () => new HttpIamRepository(),
  },
);
