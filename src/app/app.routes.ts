import { Routes } from '@angular/router';
import {
  authenticationGuard,
  guestGuard,
} from './identity-access-management/presentation/iam.guards';
import { ComingSoon } from './shared/presentation/views/coming-soon/coming-soon';

export const routes: Routes = [
  // Public area: welcome, Log In, registration and password recovery.
  {
    path: 'iam',
    canActivate: [guestGuard],
    loadChildren: () =>
      import('./identity-access-management/identity-access-management.routes').then(
        (m) => m.IDENTITY_ACCESS_MANAGEMENT_ROUTES,
      ),
  },
  // Gallery administrator area: requires an active session.
  {
    path: '',
    canActivate: [authenticationGuard],
    loadComponent: () =>
      import('./shared/presentation/views/main-layout/main-layout').then((m) => m.MainLayout),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: ComingSoon, data: { titleKey: 'nav.dashboard' } },
      {
        path: 'billing',
        loadChildren: () =>
          import('./utility-billing/utility-billing.routes').then((m) => m.UTILITY_BILLING_ROUTES),
      },
      {
        path: 'monitoring',
        loadChildren: () =>
          import('./service-execution-monitoring/presentation/monitoring.routes').then(
            (m) => m.MONITORING_ROUTES,
          ),
      },
      {
        path: 'commercial-units',
        component: ComingSoon,
        data: { titleKey: 'nav.commercial_units' },
      },
      {
        path: 'devices',
        loadComponent: () =>
          import('./resource-asset-management/presentation/views/iot-device-list/iot-device-list').then(
            (m) => m.IoTDeviceList,
          ),
        data: { titleKey: 'nav.devices' },
      },
      { path: 'utility-meters', component: ComingSoon, data: { titleKey: 'nav.utility_meters' } },
      { path: 'security', component: ComingSoon, data: { titleKey: 'nav.security' } },
      { path: 'communication', component: ComingSoon, data: { titleKey: 'nav.communication' } },
      { path: 'subscription', component: ComingSoon, data: { titleKey: 'nav.subscription' } },
    ],
  },
  { path: '**', redirectTo: '' },
];
