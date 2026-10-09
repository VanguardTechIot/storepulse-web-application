import { BaseResource } from '../../shared/infrastructure/base-response';
import { NotificationType } from '../domain/model/notification-type.enum';
import { UtilityType } from '../domain/model/utility-type.enum';

export interface NotificationResource extends BaseResource {
  type: NotificationType;
  relatedEntityId: string;
  location: string;
  message: string;
  generatedAt: string;
  read: boolean;
  occurrences: number;
}

export interface ConsumptionRegistrationResource extends BaseResource {
  meterId: string;
  utilityType: UtilityType;
  amount: number;
  unit: string;
  period: string;
  capturedAt: string;
}
