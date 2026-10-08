import { Routes } from '@angular/router';

export const UTILITY_BILLING_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./presentation/views/utility-bill-list/utility-bill-list').then(
        (m) => m.UtilityBillList,
      ),
  },
  {
    path: 'generate',
    loadComponent: () =>
      import('./presentation/views/generate-utility-bill/generate-utility-bill').then(
        (m) => m.GenerateUtilityBill,
      ),
  },
  {
    path: 'bills/:billId',
    loadComponent: () =>
      import('./presentation/views/utility-bill-detail/utility-bill-detail').then(
        (m) => m.UtilityBillDetail,
      ),
  },
  {
    path: 'bills/:billId/breakdown',
    loadComponent: () =>
      import('./presentation/views/billing-breakdown/billing-breakdown').then(
        (m) => m.BillingBreakdown,
      ),
  },
  {
    path: 'disputes',
    loadComponent: () =>
      import('./presentation/views/billing-dispute-list/billing-dispute-list').then(
        (m) => m.BillingDisputeList,
      ),
  },
  {
    path: 'disputes/:disputeId',
    loadComponent: () =>
      import('./presentation/views/billing-dispute-detail/billing-dispute-detail').then(
        (m) => m.BillingDisputeDetail,
      ),
  },
];
