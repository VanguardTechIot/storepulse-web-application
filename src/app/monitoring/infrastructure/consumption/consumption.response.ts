import { BaseResource } from '../../../shared/infrastructure/base-response';
import { ConsumptionType } from '../../domain/model/measurement-type';

export interface ConsumptionResource extends BaseResource {
  resourceId: string;
  measurementType: ConsumptionType;
  totalValue: number;
  unit: string;
  periodStart: string;
  periodEnd: string;
}
