import { ConsumptionRegistration } from '../../domain/model/consumption-registration.entity';
import { ConsumptionValue } from '../../domain/value-objects/consumption-value.value-object';
import{ Notification } from '../../domain/model/notification.entity';
import { ConsumptionRegistrationResource, NotificationResource } from './analytics-responses';

// Read-only resources: the web application never sends them back, so only the inbound mapping exists.

export class NotificationAssembler {
  toEntityFromResource(r: NotificationResource): Notification {
    return new Notification(
      r.id,
      r.type,
      r.relatedEntityId,
      r.location,
      r.message,
      new Date(r.generatedAt),
      r.read,
      r.occurrences,
    );
  }
}

export class ConsumptionRegistrationAssembler {
  toEntityFromResource(r: ConsumptionRegistrationResource): ConsumptionRegistration {
    return new ConsumptionRegistration(
      r.id,
      r.meterId,
      r.utilityType,
      new ConsumptionValue(r.amount, r.unit),
      r.period,
      new Date(r.capturedAt),
    );
  }
}
