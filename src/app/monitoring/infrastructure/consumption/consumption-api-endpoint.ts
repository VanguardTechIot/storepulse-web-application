import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { retryOnDroppedConnection } from '../../../shared/infrastructure/retry-on-dropped-connection';
import { Consumption } from '../../domain/model/consumption.entity';
import { ConsumptionAssembler } from './consumption.assembler';
import { ConsumptionResource } from './consumption.response';

const CONSUMPTION_URL = `${environment.platformProviderApiBaseUrl}${environment.platformProviderConsumptionEndpointPath}`;

export class ConsumptionApiEndpoint {
  private readonly assembler = new ConsumptionAssembler();

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<Consumption[]> {
    return this.http.get<ConsumptionResource[]>(CONSUMPTION_URL).pipe(
      retryOnDroppedConnection(),
      map((resources) => this.assembler.toEntitiesFromResources(resources)),
    );
  }
}
