import { Routes } from '@angular/router';
import { MainLayout } from './shared/presentation/views/main-layout/main-layout';

export const routes: Routes = [
  { path: '', pathMatch: 'full', children: [] },
  {
    path: '',
    component: MainLayout,
    children: [
      {
        path: 'monitoring',
        loadChildren: () =>
          import('./service-execution-monitoring/presentation/monitoring.routes').then((m) => m.MONITORING_ROUTES),
      },
      {
        path: '**',
        title: 'routeTitles.notFound',
        loadComponent: () =>
          import('./shared/presentation/views/page-not-found/page-not-found').then((m) => m.PageNotFound),
      },
    ],
  },
];
