import { InjectionToken } from '@angular/core';
import { IamRepository } from '../domain/repository/iam.repository';
import { HttpIamRepository } from './http/http-iam.repository';

/**
 * Punto único de inyección del repositorio.
 * Hoy apunta al servidor de datos local; con el REST API real se cambia la implementación aquí.
 */
export const IDENTITY_ACCESS_REPOSITORY = new InjectionToken<IamRepository>(
  'IDENTITY_ACCESS_REPOSITORY',
  {
    providedIn: 'root',
    factory: () => new HttpIamRepository(),
  },
);
