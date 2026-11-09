import { InjectionToken } from '@angular/core';
import { ResourceAssetRepository } from '../domain/repository/resource-asset.repository';
import { HttpResourceAssetRepository } from './repositories/http-resource-asset.repository';

/** Single injection point of the repository. */
export const RESOURCE_ASSET_REPOSITORY = new InjectionToken<ResourceAssetRepository>(
  'RESOURCE_ASSET_REPOSITORY',
  {
    providedIn: 'root',
    factory: () => new HttpResourceAssetRepository(),
  },
);
