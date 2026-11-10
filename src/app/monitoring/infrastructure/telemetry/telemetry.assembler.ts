import { Measurement } from '../../domain/model/measurement.entity';
import { Telemetry } from '../../domain/model/telemetry.entity';
import { MeasurementResource, TelemetryResource } from './telemetry.response';

export class MeasurementAssembler {
  toEntityFromResource(r: MeasurementResource, telemetryId: string): Measurement {
    return new Measurement(
      String(r.id),
      telemetryId,
      r.type,
      r.value,
      r.unit,
      new Date(r.recordedAt),
    );
  }
}

export class TelemetryAssembler {
  private readonly measurementAssembler = new MeasurementAssembler();

  toEntityFromResource(r: TelemetryResource): Telemetry {
    const id = String(r.id);
    return new Telemetry(
      id,
      String(r.deviceId),
      new Date(r.receivedAt),
      (r.measurements ?? []).map((m) => this.measurementAssembler.toEntityFromResource(m, id)),
    );
  }

  toEntitiesFromResources(resources: TelemetryResource[]): Telemetry[] {
    return resources.map((r) => this.toEntityFromResource(r));
  }
}
