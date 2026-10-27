import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { retryOnDroppedConnection } from '../../../shared/infrastructure/retry-on-dropped-connection';
import { Telemetry } from '../../domain/model/telemetry.entity';
import { TelemetryAssembler } from './telemetry.assembler';
import { TelemetryResource } from './telemetry.response';

const TELEMETRY_URL = `${environment.platformProviderApiBaseUrl}${environment.platformProviderTelemetryEndpointPath}`;

export class TelemetryApiEndpoint {
  private readonly assembler = new TelemetryAssembler();

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<Telemetry[]> {
    return this.http
      .get<TelemetryResource[]>(TELEMETRY_URL, { params: { _embed: 'measurements' } })
      .pipe(
        retryOnDroppedConnection(),
        map((resources) => this.assembler.toEntitiesFromResources(resources)),
      );
  }
}
