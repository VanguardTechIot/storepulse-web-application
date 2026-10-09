import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { ConsumptionRegistration } from '../domain/model/consumption-registration.entity';
import { ConsumptionValue } from '../domain/model/consumption-value.value-object';
import { Notification } from '../domain/model/notification.entity';
import { ConsumptionRegistrationResource, NotificationResource } from './analytics-responses';

export class NotificationAssembler implements BaseAssembler<Notification, NotificationResource> {
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

  toResourceFromEntity(e: Notification): NotificationResource {
    return {
      id: e.id,
      type: e.type,
      relatedEntityId: e.relatedEntityId,
      location: e.location,
      message: e.message,
      generatedAt: e.generatedAt.toISOString(),
      read: e.read,
      occurrences: e.occurrences,
    };
  }
}

export class ConsumptionRegistrationAssembler implements BaseAssembler<
  ConsumptionRegistration,
  ConsumptionRegistrationResource
> {
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

  toResourceFromEntity(e: ConsumptionRegistration): ConsumptionRegistrationResource {
    return {
      id: e.id,
      meterId: e.meterId,
      utilityType: e.utilityType,
      amount: e.value.amount,
      unit: e.value.unit,
      period: e.period,
      capturedAt: e.capturedAt.toISOString(),
    };
  }
}
