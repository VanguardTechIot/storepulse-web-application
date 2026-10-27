import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { MonitoringApi } from '../../../monitoring/infrastructure/monitoring-api';

/**
 * Anti-corruption layer towards Service Execution and Monitoring: only the number of incidents
 * still open (pending or being attended) enters the dashboard.
 */
@Injectable({ providedIn: 'root' })
export class MonitoringContextFacade {
  private readonly monitoringApi = inject(MonitoringApi);

  /** Security route where the administrator attends the incidents. */
  readonly incidentsRoute = ['/monitoring/alerts'];

  async countOpenIncidents(): Promise<number> {
    const alerts = await firstValueFrom(this.monitoringApi.getAlerts());
    return alerts.filter((alert) => alert.isOpen).length;
  }
}
