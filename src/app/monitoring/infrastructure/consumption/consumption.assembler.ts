import { Consumption } from '../../domain/model/consumption.entity';
import { ConsumptionResource } from './consumption.response';

export class ConsumptionAssembler {
  toEntityFromResource(r: ConsumptionResource): Consumption {
    return new Consumption(
      String(r.id),
      String(r.resourceId),
      r.measurementType,
      r.totalValue,
      r.unit,
      new Date(r.periodStart),
      new Date(r.periodEnd),
    );
  }

  toEntitiesFromResources(resources: ConsumptionResource[]): Consumption[] {
    return resources.map((r) => this.toEntityFromResource(r));
  }
}
