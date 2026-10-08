import { InjectionToken } from '@angular/core';
import { ResourceAssetRepository } from '../domain/repository/resource-asset.repository';
import { MockResourceAssetRepository } from './mock/mock-resource-asset.repository';

/**
 * Punto único de inyección del repositorio.
 * Cuando exista el backend, cambia la factory por la implementación HTTP.
 */
export const RESOURCE_ASSET_REPOSITORY = new InjectionToken<ResourceAssetRepository>(
  'RESOURCE_ASSET_REPOSITORY',
  {
    providedIn: 'root',
    factory: () => new MockResourceAssetRepository(),
  },
);
