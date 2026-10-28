import { InjectionToken } from '@angular/core';
import { IdentityAccessRepository } from '../domain/repository/identity-access.repository';
import { HttpIdentityAccessRepository } from './http/http-identity-access.repository';

/**
 * Punto único de inyección del repositorio.
 * Hoy apunta al servidor de datos local; con el REST API real se cambia la implementación aquí.
 */
export const IDENTITY_ACCESS_REPOSITORY = new InjectionToken<IdentityAccessRepository>(
  'IDENTITY_ACCESS_REPOSITORY',
  {
    providedIn: 'root',
    factory: () => new HttpIdentityAccessRepository(),
  },
);
