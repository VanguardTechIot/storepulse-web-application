import { Routes } from '@angular/router';

export const monitoringRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./views/monitoring-shell/monitoring-shell').then((m) => m.MonitoringShell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'overview' },
      {
        path: 'overview',
        loadComponent: () =>
          import('./views/telemetry-dashboard/telemetry-dashboard').then((m) => m.TelemetryDashboard),
      },
      {
        path: 'consumption',
        loadComponent: () => import('./views/consumption/consumption').then((m) => m.ConsumptionView),
      },
    ],
  },
];
