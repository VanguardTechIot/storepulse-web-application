import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BaseApi } from '../../shared/infrastructure/base-api';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { Telemetry } from '../domain/model/telemetry.entity';
import { MonitoringRule } from '../domain/model/monitoring-rule.entity';
import { Alert } from '../domain/model/alert.entity';
import { Consumption } from '../domain/model/consumption.entity';
import {
  AlertAssembler,
  ConsumptionAssembler,
  MonitoringRuleAssembler,
  TelemetryAssembler,
} from './monitoring-assemblers';

/**
 * Monitoring Service: consumes the telemetry, monitoring, alert and consumption endpoints.
 */
@Injectable({ providedIn: 'root' })
export class MonitoringApi extends BaseApi {
  private readonly alertAssembler = new AlertAssembler();

  private readonly telemetry = new BaseApiEndpoint(
    this.http,
    this.endpointUrl(environment.telemetryEndpointPath),
    new TelemetryAssembler(),
  );
  private readonly monitoringRules = new BaseApiEndpoint(
    this.http,
    this.endpointUrl(environment.monitoringRulesEndpointPath),
    new MonitoringRuleAssembler(),
  );
  private readonly alerts = new BaseApiEndpoint(
    this.http,
    this.endpointUrl(environment.alertsEndpointPath),
    this.alertAssembler,
  );
  private readonly consumption = new BaseApiEndpoint(
    this.http,
    this.endpointUrl(environment.consumptionEndpointPath),
    new ConsumptionAssembler(),
  );

  /** Telemetry records with their measurements. */
  getTelemetry(): Observable<Telemetry[]> {
    return this.telemetry.getAll({ _embed: 'measurements' });
  }

  getMonitoringRules(): Observable<MonitoringRule[]> {
    return this.monitoringRules.getAll();
  }

  updateMonitoringRuleEnabled(rule: MonitoringRule): Observable<MonitoringRule> {
    return this.monitoringRules.patch(rule.id, { enabled: rule.enabled });
  }

  getAlerts(): Observable<Alert[]> {
    return this.alerts.getAll();
  }

  getAlert(id: string): Observable<Alert> {
    return this.alerts.getById(id);
  }

  /** Persists the lifecycle fields of an alert after a domain transition. */
  updateAlertLifecycle(alert: Alert): Observable<Alert> {
    const { status, acknowledgedAt, resolvedAt, resolutionNote } = this.alertAssembler.toResourceFromEntity(alert);
    return this.alerts.patch(alert.id, { status, acknowledgedAt, resolvedAt, resolutionNote });
  }

  getConsumption(): Observable<Consumption[]> {
    return this.consumption.getAll();
  }
}
