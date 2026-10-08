import { Routes } from '@angular/router';

export const MONITORING_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'overview' },
  {
    path: 'overview',
    title: 'routeTitles.overview',
    loadComponent: () =>
      import('./views/telemetry-dashboard/telemetry-dashboard').then((m) => m.TelemetryDashboard),
  },
  {
    path: 'alerts',
    title: 'routeTitles.alerts',
    loadComponent: () => import('./views/alert-list/alert-list').then((m) => m.AlertList),
  },
  {
    path: 'alerts/:id',
    title: 'routeTitles.alertDetail',
    loadComponent: () => import('./views/alert-detail/alert-detail').then((m) => m.AlertDetail),
  },
  {
    path: 'consumption',
    title: 'routeTitles.consumption',
    loadComponent: () => import('./views/consumption/consumption').then((m) => m.ConsumptionView),
  },
  {
    path: 'rules',
    title: 'routeTitles.rules',
    loadComponent: () =>
      import('./views/monitoring-rules/monitoring-rules').then((m) => m.MonitoringRules),
  },
];
