import { BaseResource } from '../../shared/infrastructure/base-response';
import { ConsumptionType, MeasurementType } from '../domain/model/measurement-type';
import { ComparisonOperator } from '../domain/model/threshold';
import { AlertStatus } from '../domain/model/alert.entity';

export interface MeasurementResource extends BaseResource {
  telemetryId: string;
  type: MeasurementType;
  value: number;
  unit: string;
  recordedAt: string;
}

export interface TelemetryResource extends BaseResource {
  deviceId: string;
  receivedAt: string;
  measurements?: MeasurementResource[];
}

export interface MonitoringRuleResource extends BaseResource {
  name: string;
  measurementType: MeasurementType;
  threshold: { value: number; operator: ComparisonOperator };
  enabled: boolean;
  createdAt: string;
}

export interface AlertResource extends BaseResource {
  ruleId: string;
  measurementId: string;
  status: AlertStatus;
  createdAt: string;
  acknowledgedAt: string | null;
  resolvedAt: string | null;
  resolutionNote: string | null;
}

export interface ConsumptionResource extends BaseResource {
  resourceId: string;
  measurementType: ConsumptionType;
  totalValue: number;
  unit: string;
  periodStart: string;
  periodEnd: string;
}
