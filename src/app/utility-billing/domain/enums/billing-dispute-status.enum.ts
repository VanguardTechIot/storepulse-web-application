/** Life cycle of a dispute: the administrator reviews it and then resolves it. */
export enum BillingDisputeStatus {
  Open = 'OPEN',
  UnderReview = 'UNDER_REVIEW',
  Resolved = 'RESOLVED',
}
