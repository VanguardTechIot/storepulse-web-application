import { Telemetry } from '../model/telemetry.entity';
import { MonitoringRule } from '../model/monitoring-rule.entity';
import { Alert } from '../model/alert.entity';
import { Consumption } from '../model/consumption.entity';

/** Abstracción de persistencia del contexto Service Execution and Monitoring. */
export interface MonitoringRepository {
  /** Telemetría con sus mediciones. */
  listTelemetry(): Promise<Telemetry[]>;
  listMonitoringRules(): Promise<MonitoringRule[]>;
  saveMonitoringRule(rule: MonitoringRule): Promise<void>;
  listAlerts(): Promise<Alert[]>;
  findAlert(id: string): Promise<Alert | null>;
  saveAlert(alert: Alert): Promise<void>;
  listConsumption(): Promise<Consumption[]>;
}
