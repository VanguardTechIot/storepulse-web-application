import { Routes } from '@angular/router';
import { authenticationGuard, guestGuard } from './iam/presentation/iam.guards';

export const routes: Routes = [
  // Public area: welcome, Log In, registration and password recovery.
  {
    path: 'iam',
    canActivate: [guestGuard],
    loadChildren: () => import('./iam/iam.routes').then((m) => m.IDENTITY_ACCESS_MANAGEMENT_ROUTES),
  },
  // Gallery administrator area: requires an active session.
  {
    path: '',
    canActivate: [authenticationGuard],
    loadComponent: () =>
      import('./shared/presentation/views/main-layout/main-layout').then((m) => m.MainLayout),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./dashboard-analytics').then((m) => m.DASHBOARD_ANALYTICS_ROUTES),
      },
      {
        path: 'billing',
        loadChildren: () => import('./utility-billing').then((m) => m.UTILITY_BILLING_ROUTES),
      },
      {
        path: 'profile',
        loadChildren: () =>
          import('./profiles-preferences/profiles-preferences.routes').then(
            (m) => m.PROFILES_PREFERENCES_ROUTES,
          ),
      },
      {
        path: 'monitoring',
        loadChildren: () =>
          import('./monitoring/presentation/monitoring.routes').then((m) => m.monitoringRoutes),
      },
      {
        path: 'commercial-units',
        loadChildren: () =>
          import('./property-management').then((m) => m.PROPERTY_MANAGEMENT_ROUTES),
      },
      {
        path: 'devices',
        loadChildren: () =>
          import('./resource-asset-management/resource-asset-management.routes').then(
            (m) => m.RESOURCE_ASSET_MANAGEMENT_ROUTES,
          ),
        data: { titleKey: 'nav.devices' },
      },
      {
        path: 'communication',
        loadChildren: () =>
          import('./property-communication/property-communication.routes').then(
            (m) => m.PROPERTY_COMMUNICATION_ROUTES,
          ),
      },
      {
        path: 'subscription',
        loadChildren: () =>
          import('./subscriptions-payments').then((m) => m.SUBSCRIPTIONS_PAYMENTS_ROUTES),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
