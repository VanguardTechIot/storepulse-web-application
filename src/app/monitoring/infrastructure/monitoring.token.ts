import { InjectionToken } from '@angular/core';
import { MonitoringRepository } from '../domain/repository/monitoring.repository';
import { MockMonitoringRepository } from './mock/mock-monitoring.repository';

/**
 * Punto único de inyección del repositorio.
 * Cuando exista el backend, cambia la factory por la implementación HTTP.
 */
export const MONITORING_REPOSITORY = new InjectionToken<MonitoringRepository>(
  'MONITORING_REPOSITORY',
  {
    providedIn: 'root',
    factory: () => new MockMonitoringRepository(),
  },
);
