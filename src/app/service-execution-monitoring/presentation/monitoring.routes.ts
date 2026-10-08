import { Routes } from '@angular/router';

export const MONITORING_ROUTES: Routes = [
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
        path: 'alerts',
        loadComponent: () => import('./views/alert-list/alert-list').then((m) => m.AlertList),
      },
      {
        path: 'alerts/:id',
        loadComponent: () => import('./views/alert-detail/alert-detail').then((m) => m.AlertDetail),
      },
      {
        path: 'consumption',
        loadComponent: () => import('./views/consumption/consumption').then((m) => m.ConsumptionView),
      },
      {
        path: 'rules',
        loadComponent: () =>
          import('./views/monitoring-rules/monitoring-rules').then((m) => m.MonitoringRules),
      },
    ],
  },
];
