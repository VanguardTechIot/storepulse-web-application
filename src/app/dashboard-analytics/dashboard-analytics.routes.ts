import { Routes } from '@angular/router';

/** Route titles are i18n keys, translated by `TranslatedTitleStrategy`. */
export const DASHBOARD_ANALYTICS_ROUTES: Routes = [
  {
    path: '',
    title: 'analytics.dashboard.page_title',
    loadComponent: () =>
      import('./presentation/views/consolidated-dashboard/consolidated-dashboard').then(
        (m) => m.ConsolidatedDashboard,
      ),
  },
  {
    path: 'notifications',
    title: 'analytics.notifications.page_title',
    loadComponent: () =>
      import('./presentation/views/notification-center/notification-center').then(
        (m) => m.NotificationCenter,
      ),
  },
];
