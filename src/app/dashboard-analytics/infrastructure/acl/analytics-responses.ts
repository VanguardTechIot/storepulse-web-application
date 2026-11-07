import { AlertStatus } from '../../domain/enums/alert-status.enum';
import { SensorType } from '../../domain/enums/sensor-type.enum';

export interface DashboardSummaryResource {
  alerts: {
    open: number;
    active: number;
    acknowledged: number;
    resolved: number;
    openBySensorType: Partial<Record<SensorType, number>>;
  };
  consumption: {
    electricityKwh: number;
    waterCubicMeters: number;
  };
}

export interface AlertResource {
  id: number;
  safetyRuleId: number;
  deviceId: number;
  measurementId: number;
  sensorType: SensorType;
  measuredValue: number;
  status: AlertStatus;
  detectedAt: string;
  acknowledgedAt: string | null;
  resolvedAt: string | null;
  resolutionNote: string | null;
}

export interface ResolveAlertResource {
  resolutionNote: string;
}
