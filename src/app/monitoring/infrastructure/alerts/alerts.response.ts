import { BaseResource } from '../../../shared/infrastructure/base-response';
import { AlertStatus } from '../../domain/model/alert.entity';

export interface AlertResource extends BaseResource {
  ruleId: string;
  measurementId: string;
  status: AlertStatus;
  createdAt: string;
  acknowledgedAt: string | null;
  resolvedAt: string | null;
  resolutionNote: string | null;
}
