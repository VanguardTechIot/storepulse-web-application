import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { retryOnDroppedConnection } from '../../../shared/infrastructure/retry-on-dropped-connection';
import { Alert } from '../../domain/model/alert.entity';
import { AlertAssembler } from './alerts.assembler';
import { AlertResource } from './alerts.response';

const ALERTS_URL = `${environment.platformProviderApiBaseUrl}${environment.platformProviderAlertsEndpointPath}`;

export class AlertsApiEndpoint {
  private readonly assembler = new AlertAssembler();

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<Alert[]> {
    return this.http.get<AlertResource[]>(ALERTS_URL).pipe(
      retryOnDroppedConnection(),
      map((resources) => this.assembler.toEntitiesFromResources(resources)),
    );
  }

  getById(id: string): Observable<Alert> {
    return this.http.get<AlertResource>(`${ALERTS_URL}/${encodeURIComponent(id)}`).pipe(
      retryOnDroppedConnection(),
      map((resource) => this.assembler.toEntityFromResource(resource)),
    );
  }

  update(alert: Alert): Observable<Alert> {
    return this.http
      .put<AlertResource>(
        `${ALERTS_URL}/${encodeURIComponent(alert.id)}`,
        this.assembler.toResourceFromEntity(alert),
      )
      .pipe(
        retryOnDroppedConnection(),
        map((resource) => this.assembler.toEntityFromResource(resource)),
      );
  }
}
