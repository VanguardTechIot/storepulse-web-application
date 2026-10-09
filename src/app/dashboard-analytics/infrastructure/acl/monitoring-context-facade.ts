import { inject, Injectable } from '@angular/core';
import { MONITORING_REPOSITORY } from '../../../service-execution-monitoring/infrastructure/monitoring.token';

/**
 * Anti-corruption layer towards Service Execution and Monitoring: only the number of incidents
 * still open (pending or being attended) enters the dashboard.
 */
@Injectable({ providedIn: 'root' })
export class MonitoringContextFacade {
  private readonly repository = inject(MONITORING_REPOSITORY);

  /** Security route where the administrator attends the incidents. */
  readonly incidentsRoute = ['/monitoring/alerts'];

  async countOpenIncidents(): Promise<number> {
    const alerts = await this.repository.listAlerts();
    return alerts.filter((alert) => alert.isOpen).length;
  }
}
