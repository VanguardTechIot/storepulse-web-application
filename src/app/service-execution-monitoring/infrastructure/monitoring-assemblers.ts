import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { Telemetry } from '../domain/model/telemetry.entity';
import { Measurement } from '../domain/model/measurement.entity';
import { MonitoringRule } from '../domain/model/monitoring-rule.entity';
import { Threshold } from '../domain/model/threshold';
import { Alert } from '../domain/model/alert.entity';
import { Consumption } from '../domain/model/consumption.entity';
import {
  AlertResource,
  ConsumptionResource,
  MeasurementResource,
  MonitoringRuleResource,
  TelemetryResource,
} from './monitoring-responses';

const toDate = (value: string | null): Date | null => (value ? new Date(value) : null);

export class MeasurementAssembler implements BaseAssembler<Measurement, MeasurementResource> {
  toEntityFromResource(r: MeasurementResource): Measurement {
    return new Measurement(r.id, r.telemetryId, r.type, r.value, r.unit, new Date(r.recordedAt));
  }

  toResourceFromEntity(e: Measurement): MeasurementResource {
    return {
      id: e.id,
      telemetryId: e.telemetryId,
      type: e.type,
      value: e.value,
      unit: e.unit,
      recordedAt: e.recordedAt.toISOString(),
    };
  }
}

export class TelemetryAssembler implements BaseAssembler<Telemetry, TelemetryResource> {
  private readonly measurementAssembler = new MeasurementAssembler();

  toEntityFromResource(r: TelemetryResource): Telemetry {
    return new Telemetry(
      r.id,
      r.deviceId,
      new Date(r.receivedAt),
      (r.measurements ?? []).map((m) => this.measurementAssembler.toEntityFromResource(m)),
    );
  }

  toResourceFromEntity(e: Telemetry): TelemetryResource {
    return {
      id: e.id,
      deviceId: e.deviceId,
      receivedAt: e.receivedAt.toISOString(),
      measurements: e.measurements.map((m) => this.measurementAssembler.toResourceFromEntity(m)),
    };
  }
}

export class MonitoringRuleAssembler implements BaseAssembler<MonitoringRule, MonitoringRuleResource> {
  toEntityFromResource(r: MonitoringRuleResource): MonitoringRule {
    return new MonitoringRule(
      r.id,
      r.name,
      r.measurementType,
      new Threshold(r.threshold.value, r.threshold.operator),
      r.enabled,
      new Date(r.createdAt),
    );
  }

  toResourceFromEntity(e: MonitoringRule): MonitoringRuleResource {
    return {
      id: e.id,
      name: e.name,
      measurementType: e.measurementType,
      threshold: { value: e.threshold.value, operator: e.threshold.operator },
      enabled: e.enabled,
      createdAt: e.createdAt.toISOString(),
    };
  }
}

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
}

export class ConsumptionAssembler implements BaseAssembler<Consumption, ConsumptionResource> {
  toEntityFromResource(r: ConsumptionResource): Consumption {
    return new Consumption(
      r.id,
      r.resourceId,
      r.measurementType,
      r.totalValue,
      r.unit,
      new Date(r.periodStart),
      new Date(r.periodEnd),
    );
  }

  toResourceFromEntity(e: Consumption): ConsumptionResource {
    return {
      id: e.id,
      resourceId: e.resourceId,
      measurementType: e.measurementType,
      totalValue: e.totalValue,
      unit: e.unit,
      periodStart: e.periodStart.toISOString(),
      periodEnd: e.periodEnd.toISOString(),
    };
  }
}
