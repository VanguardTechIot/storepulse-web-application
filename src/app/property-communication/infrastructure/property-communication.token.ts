import { InjectionToken } from '@angular/core';
import { PropertyCommunicationRepository } from '../domain/repository/property-communication.repository';
import { HttpPropertyCommunicationRepository } from './http/http-property-communication.repository';

/**
 * Single injection point of the repository.
 * It points to the local data server today; with the real REST API, swap the implementation here.
 */
export const PROPERTY_COMMUNICATION_REPOSITORY =
  new InjectionToken<PropertyCommunicationRepository>('PROPERTY_COMMUNICATION_REPOSITORY', {
    providedIn: 'root',
    factory: () => new HttpPropertyCommunicationRepository(),
  });
