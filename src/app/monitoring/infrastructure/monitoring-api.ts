import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Telemetry } from '../domain/model/telemetry.entity';
import { MonitoringRule } from '../domain/model/monitoring-rule.entity';
import { Alert } from '../domain/model/alert.entity';
import { Consumption } from '../domain/model/consumption.entity';
import { TelemetryApiEndpoint } from './telemetry/telemetry-api-endpoint';
import { MonitoringRulesApiEndpoint } from './monitoring-rules/monitoring-rules-api-endpoint';
import { AlertsApiEndpoint } from './alerts/alerts-api-endpoint';
import { ConsumptionApiEndpoint } from './consumption/consumption-api-endpoint';

@Injectable({ providedIn: 'root' })
export class MonitoringApi {
  private readonly http = inject(HttpClient);
  private readonly telemetryEndpoint = new TelemetryApiEndpoint(this.http);
  private readonly monitoringRulesEndpoint = new MonitoringRulesApiEndpoint(this.http);
  private readonly alertsEndpoint = new AlertsApiEndpoint(this.http);
  private readonly consumptionEndpoint = new ConsumptionApiEndpoint(this.http);

  getTelemetry(): Observable<Telemetry[]> {
    return this.telemetryEndpoint.getAll();
  }

  getMonitoringRules(): Observable<MonitoringRule[]> {
    return this.monitoringRulesEndpoint.getAll();
  }

  updateMonitoringRule(rule: MonitoringRule): Observable<MonitoringRule> {
    return this.monitoringRulesEndpoint.update(rule);
  }

  getAlerts(): Observable<Alert[]> {
    return this.alertsEndpoint.getAll();
  }

  getAlertById(id: string): Observable<Alert> {
    return this.alertsEndpoint.getById(id);
  }

  updateAlert(alert: Alert): Observable<Alert> {
    return this.alertsEndpoint.update(alert);
  }

  getConsumption(): Observable<Consumption[]> {
    return this.consumptionEndpoint.getAll();
  }
}
