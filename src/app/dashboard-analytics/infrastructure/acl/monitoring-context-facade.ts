import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';

const ALERTS_URL = `${environment.platformProviderApiBaseUrl}${environment.platformProviderAlertsEndpointPath}`;

/**
 * Only the number of incidents still open (pending or being attended) enters the dashboard.
 */
@Injectable({ providedIn: 'root' })
export class MonitoringContextFacade {
  private readonly http = inject(HttpClient);

  /** Security route where the administrator attends the incidents. */
  readonly incidentsRoute = ['/security'];

  async countOpenIncidents(): Promise<number> {
    const alerts = await firstValueFrom(this.http.get<{ status: string }[]>(ALERTS_URL));
    return alerts.filter((alert) => alert.status !== 'RESOLVED').length;
  }
}
