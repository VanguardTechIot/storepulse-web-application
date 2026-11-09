import { ConsumptionType } from '../../domain/model/measurement-type';

export interface ConsumptionResource {
  id: number;
  resourceId: number;
  measurementType: ConsumptionType;
  totalValue: number;
  unit: string;
  periodStart: string;
  periodEnd: string;
}
