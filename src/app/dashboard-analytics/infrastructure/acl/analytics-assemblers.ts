import { Alert } from '../../domain/model/alert.entity';
import { DashboardSummary } from '../../domain/model/dashboard-summary';
import { ConsumptionValue } from '../../domain/value-objects/consumption-value.value-object';
import { AlertResource, DashboardSummaryResource } from './analytics-responses';

// Both resources are read-only for the web: they only map inbound.
export class DashboardSummaryAssembler {
  toEntityFromResource(r: DashboardSummaryResource): DashboardSummary {
    return new DashboardSummary(
      { ...r.alerts, openBySensorType: { ...r.alerts.openBySensorType } },
      new ConsumptionValue(r.consumption.electricityKwh, 'kWh'),
      new ConsumptionValue(r.consumption.waterCubicMeters, 'm³'),
    );
  }
}

export class AlertAssembler {
  toEntityFromResource(r: AlertResource): Alert {
    const date = (value: string | null) => (value ? new Date(value) : null);
    return Alert.restore({
      id: String(r.id),
      deviceId: String(r.deviceId),
      sensorType: r.sensorType,
      measuredValue: r.measuredValue,
      status: r.status,
      detectedAt: new Date(r.detectedAt),
      acknowledgedAt: date(r.acknowledgedAt),
      resolvedAt: date(r.resolvedAt),
      resolutionNote: r.resolutionNote,
    });
  }
}
