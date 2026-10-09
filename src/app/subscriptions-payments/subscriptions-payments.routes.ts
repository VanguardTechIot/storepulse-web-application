import { Routes } from '@angular/router';

/** Route titles are i18n keys, translated by `TranslatedTitleStrategy`. */
export const SUBSCRIPTIONS_PAYMENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./presentation/views/subscription-shell/subscription-shell').then(
        (m) => m.SubscriptionShell,
      ),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'status' },
      {
        path: 'status',
        title: 'subscriptions.status.page_title',
        loadComponent: () =>
          import('./presentation/views/subscription-status/subscription-status').then(
            (m) => m.SubscriptionStatusView,
          ),
      },
      {
        path: 'plans',
        title: 'subscriptions.plans_page.page_title',
        loadComponent: () =>
          import('./presentation/views/plan-catalog/plan-catalog').then((m) => m.PlanCatalog),
      },
      {
        path: 'payments',
        title: 'subscriptions.payments.page_title',
        loadComponent: () =>
          import('./presentation/views/payment-history/payment-history').then(
            (m) => m.PaymentHistory,
          ),
      },
    ],
  },
  {
    path: 'checkout/:planId',
    title: 'subscriptions.checkout.page_title',
    loadComponent: () =>
      import('./presentation/views/subscription-checkout/subscription-checkout').then(
        (m) => m.SubscriptionCheckout,
      ),
  },
];
