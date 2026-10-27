import { BaseAssembler } from '../../../shared/infrastructure/base-assembler';
import { Measurement } from '../../domain/model/measurement.entity';
import { Telemetry } from '../../domain/model/telemetry.entity';
import { MeasurementResource, TelemetryResource } from './telemetry.response';

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

  toEntitiesFromResources(resources: TelemetryResource[]): Telemetry[] {
    return resources.map((r) => this.toEntityFromResource(r));
  }
}
