import { InjectionToken } from '@angular/core';
import { PropertyManagementRepository } from '../domain/repository/property-management.repository';
import { HttpPropertyManagementRepository } from './http/http-property-management.repository';

/**
 * Single injection point of the repository.
 * It points to the local data server today; with the real REST API, swap the implementation here.
 */
export const PROPERTY_MANAGEMENT_REPOSITORY = new InjectionToken<PropertyManagementRepository>(
  'PROPERTY_MANAGEMENT_REPOSITORY',
  {
    providedIn: 'root',
    factory: () => new HttpPropertyManagementRepository(),
  },
);
