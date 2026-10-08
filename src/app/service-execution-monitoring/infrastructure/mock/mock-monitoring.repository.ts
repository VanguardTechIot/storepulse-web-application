import { Telemetry } from '../../domain/model/telemetry.entity';
import { MonitoringRule } from '../../domain/model/monitoring-rule.entity';
import { Alert } from '../../domain/model/alert.entity';
import { Consumption } from '../../domain/model/consumption.entity';
import { MonitoringRepository } from '../../domain/repository/monitoring.repository';
import {
  AlertAssembler,
  ConsumptionAssembler,
  MonitoringRuleAssembler,
  TelemetryAssembler,
} from '../monitoring-assemblers';
import { AlertResource, MonitoringRuleResource } from '../monitoring-responses';
import { ALERTS, CONSUMPTION, MONITORING_RULES, TELEMETRY } from './monitoring.data';

/** Implementación en memoria del repositorio de Service Execution and Monitoring. */
export class MockMonitoringRepository implements MonitoringRepository {
  private readonly telemetryAssembler = new TelemetryAssembler();
  private readonly ruleAssembler = new MonitoringRuleAssembler();
  private readonly alertAssembler = new AlertAssembler();
  private readonly consumptionAssembler = new ConsumptionAssembler();

  private rules: MonitoringRuleResource[] = structuredClone(MONITORING_RULES);
  private alerts: AlertResource[] = structuredClone(ALERTS);

  async listTelemetry(): Promise<Telemetry[]> {
    return structuredClone(TELEMETRY).map((r) => this.telemetryAssembler.toEntityFromResource(r));
  }

  async listMonitoringRules(): Promise<MonitoringRule[]> {
    return structuredClone(this.rules).map((r) => this.ruleAssembler.toEntityFromResource(r));
  }

  async saveMonitoringRule(rule: MonitoringRule): Promise<void> {
    const record = this.ruleAssembler.toResourceFromEntity(rule);
    this.rules = this.rules.map((r) => (r.id === rule.id ? record : r));
  }

  async listAlerts(): Promise<Alert[]> {
    return structuredClone(this.alerts).map((r) => this.alertAssembler.toEntityFromResource(r));
  }

  async findAlert(id: string): Promise<Alert | null> {
    const record = this.alerts.find((r) => r.id === id);
    return record ? this.alertAssembler.toEntityFromResource(structuredClone(record)) : null;
  }

  async saveAlert(alert: Alert): Promise<void> {
    const record = this.alertAssembler.toResourceFromEntity(alert);
    this.alerts = this.alerts.map((r) => (r.id === alert.id ? record : r));
  }

  async listConsumption(): Promise<Consumption[]> {
    return structuredClone(CONSUMPTION).map((r) => this.consumptionAssembler.toEntityFromResource(r));
  }
}
