import { BaseAssembler } from '../../../shared/infrastructure/base-assembler';
import { Consumption } from '../../domain/model/consumption.entity';
import { ConsumptionResource } from './consumption.response';

export class ConsumptionAssembler implements BaseAssembler<Consumption, ConsumptionResource> {
  toEntityFromResource(r: ConsumptionResource): Consumption {
    return new Consumption(
      r.id,
      r.resourceId,
      r.measurementType,
      r.totalValue,
      r.unit,
      new Date(r.periodStart),
      new Date(r.periodEnd),
    );
  }

  toResourceFromEntity(e: Consumption): ConsumptionResource {
    return {
      id: e.id,
      resourceId: e.resourceId,
      measurementType: e.measurementType,
      totalValue: e.totalValue,
      unit: e.unit,
      periodStart: e.periodStart.toISOString(),
      periodEnd: e.periodEnd.toISOString(),
    };
  }

  toEntitiesFromResources(resources: ConsumptionResource[]): Consumption[] {
    return resources.map((r) => this.toEntityFromResource(r));
  }
}
