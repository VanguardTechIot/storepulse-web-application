import { BaseAssembler } from '../../../shared/infrastructure/base-assembler';
import { Alert } from '../../domain/model/alert.entity';
import { AlertResource } from './alerts.response';

const toDate = (value: string | null): Date | null => (value ? new Date(value) : null);

export class AlertAssembler implements BaseAssembler<Alert, AlertResource> {
  toEntityFromResource(r: AlertResource): Alert {
    return new Alert(
      r.id,
      r.ruleId,
      r.measurementId,
      r.status,
      new Date(r.createdAt),
      toDate(r.acknowledgedAt),
      toDate(r.resolvedAt),
      r.resolutionNote,
    );
  }

  toResourceFromEntity(e: Alert): AlertResource {
    return {
      id: e.id,
      ruleId: e.ruleId,
      measurementId: e.measurementId,
      status: e.status,
      createdAt: e.createdAt.toISOString(),
      acknowledgedAt: e.acknowledgedAt?.toISOString() ?? null,
      resolvedAt: e.resolvedAt?.toISOString() ?? null,
      resolutionNote: e.resolutionNote,
    };
  }

  toEntitiesFromResources(resources: AlertResource[]): Alert[] {
    return resources.map((r) => this.toEntityFromResource(r));
  }
}
