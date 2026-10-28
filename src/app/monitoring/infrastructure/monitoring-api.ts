import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Telemetry } from '../domain/model/telemetry.entity';
import { Consumption } from '../domain/model/consumption.entity';
import { TelemetryApiEndpoint } from './telemetry/telemetry-api-endpoint';
import { ConsumptionApiEndpoint } from './consumption/consumption-api-endpoint';

@Injectable({ providedIn: 'root' })
export class MonitoringApi {
  private readonly http = inject(HttpClient);
  private readonly telemetryEndpoint = new TelemetryApiEndpoint(this.http);
  private readonly consumptionEndpoint = new ConsumptionApiEndpoint(this.http);

  getTelemetry(): Observable<Telemetry[]> {
    return this.telemetryEndpoint.getAll();
  }

  getConsumption(): Observable<Consumption[]> {
    return this.consumptionEndpoint.getAll();
  }
}
