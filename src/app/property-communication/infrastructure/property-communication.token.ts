import { InjectionToken } from '@angular/core';
import { PropertyCommunicationRepository } from '../domain/repository/property-communication.repository';
import { HttpPropertyCommunicationRepository } from './http/http-property-communication.repository';

/** Single injection point of the repository, implemented over the StorePulse REST API. */
export const PROPERTY_COMMUNICATION_REPOSITORY =
  new InjectionToken<PropertyCommunicationRepository>('PROPERTY_COMMUNICATION_REPOSITORY', {
    providedIn: 'root',
    factory: () => new HttpPropertyCommunicationRepository(),
  });
