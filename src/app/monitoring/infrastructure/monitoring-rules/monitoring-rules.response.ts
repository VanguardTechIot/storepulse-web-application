import { BaseResource } from '../../../shared/infrastructure/base-response';
import { MeasurementType } from '../../domain/model/measurement-type';
import { ComparisonOperator } from '../../domain/model/threshold';

export interface MonitoringRuleResource extends BaseResource {
  name: string;
  measurementType: MeasurementType;
  threshold: { value: number; operator: ComparisonOperator };
  enabled: boolean;
  createdAt: string;
}
