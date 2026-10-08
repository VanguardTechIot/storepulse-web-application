import { BaseEntity } from '../domain/model/base-entity';
import { BaseResource } from './base-response';

/**
 * Translates REST API resources into domain entities and back.
 */
export interface BaseAssembler<TEntity extends BaseEntity, TResource extends BaseResource> {
  toEntityFromResource(resource: TResource): TEntity;
  toResourceFromEntity(entity: TEntity): TResource;
}
