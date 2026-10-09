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
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./dashboard-analytics/dashboard-analytics.routes').then(
            (m) => m.DASHBOARD_ANALYTICS_ROUTES,
          ),
      },
      {
        path: 'billing',
        loadChildren: () =>
          import('./utility-billing/utility-billing.routes').then((m) => m.UTILITY_BILLING_ROUTES),
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
          import('./service-execution-monitoring/presentation/monitoring.routes').then(
            (m) => m.MONITORING_ROUTES,
          ),
      },
      {
        path: 'commercial-units',
        loadChildren: () =>
          import('./property-management/property-management.routes').then(
            (m) => m.PROPERTY_MANAGEMENT_ROUTES,
          ),
      },
      {
        path: 'devices',
        loadChildren: () =>
          import('./resource-asset-management/resource-asset-management.routes').then(
            (m) => m.RESOURCE_ASSET_MANAGEMENT_ROUTES,
          ),
        data: { titleKey: 'nav.devices' },
      },
      { path: 'utility-meters', component: ComingSoon, data: { titleKey: 'nav.utility_meters' } },
      { path: 'security', component: ComingSoon, data: { titleKey: 'nav.security' } },
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
          import('./subscriptions-payments/subscriptions-payments.routes').then(
            (m) => m.SUBSCRIPTIONS_PAYMENTS_ROUTES,
          ),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
