import { Routes } from '@angular/router';
import { MainLayout } from './shared/presentation/views/main-layout/main-layout';
import { ComingSoon } from './shared/presentation/views/coming-soon/coming-soon';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: ComingSoon, data: { titleKey: 'nav.dashboard' } },
      {
        path: 'billing',
        loadChildren: () =>
          import('./utility-billing/utility-billing.routes').then((m) => m.UTILITY_BILLING_ROUTES),
      },
      { path: 'commercial-units', component: ComingSoon, data: { titleKey: 'nav.commercial_units' } },
      { path: 'devices', component: ComingSoon, data: { titleKey: 'nav.devices' } },
      { path: 'utility-meters', component: ComingSoon, data: { titleKey: 'nav.utility_meters' } },
      { path: 'security', component: ComingSoon, data: { titleKey: 'nav.security' } },
      { path: 'communication', component: ComingSoon, data: { titleKey: 'nav.communication' } },
      { path: 'subscription', component: ComingSoon, data: { titleKey: 'nav.subscription' } },
    ],
  },
  { path: '**', redirectTo: '' },
];
