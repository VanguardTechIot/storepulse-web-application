import { Routes } from '@angular/router';

/** Route titles are i18n keys, translated by `TranslatedTitleStrategy`. */
export const UTILITY_BILLING_ROUTES: Routes = [
  {
    path: '',
    title: 'billing.list.page_title',
    loadComponent: () =>
      import('./presentation/views/utility-bill-list/utility-bill-list').then(
        (m) => m.UtilityBillList,
      ),
  },
  {
    path: 'generate',
    title: 'billing.generate.page_title',
    loadComponent: () =>
      import('./presentation/views/generate-utility-bill/generate-utility-bill').then(
        (m) => m.GenerateUtilityBill,
      ),
  },
  {
    path: 'bills/:billId',
    title: 'billing.detail.page_title',
    loadComponent: () =>
      import('./presentation/views/utility-bill-detail/utility-bill-detail').then(
        (m) => m.UtilityBillDetail,
      ),
  },
  {
    path: 'bills/:billId/breakdown',
    title: 'billing.breakdown.page_title',
    loadComponent: () =>
      import('./presentation/views/billing-breakdown/billing-breakdown').then(
        (m) => m.BillingBreakdown,
      ),
  },
  {
    path: 'disputes',
    title: 'billing.disputes.page_title',
    loadComponent: () =>
      import('./presentation/views/billing-dispute-list/billing-dispute-list').then(
        (m) => m.BillingDisputeList,
      ),
  },
  {
    path: 'disputes/:disputeId',
    title: 'billing.dispute.title',
    loadComponent: () =>
      import('./presentation/views/billing-dispute-detail/billing-dispute-detail').then(
        (m) => m.BillingDisputeDetail,
      ),
  },
];
