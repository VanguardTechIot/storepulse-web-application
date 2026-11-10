import { InjectionToken } from '@angular/core';
import { PropertyManagementRepository } from '../domain/repository/property-management.repository';
import { HttpPropertyManagementRepository } from './http/http-property-management.repository';

/** Single injection point of the repository, implemented over the StorePulse REST API. */
export const PROPERTY_MANAGEMENT_REPOSITORY = new InjectionToken<PropertyManagementRepository>(
  'PROPERTY_MANAGEMENT_REPOSITORY',
  {
    providedIn: 'root',
    factory: () => new HttpPropertyManagementRepository(),
  },
);
