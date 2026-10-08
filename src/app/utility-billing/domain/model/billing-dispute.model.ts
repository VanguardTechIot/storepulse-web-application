export type BillingDisputeStatus = 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED';

export type DisputeReason = 'CONSUMPTION_ABOVE_BASELINE' | 'RATE' | 'METER_READING' | 'OTHER';

export interface BillingDispute {
  readonly id: string;
  readonly code: string;
  readonly billId: string;
  readonly tenantName: string;
  readonly reason: DisputeReason;
  readonly description: string;
  readonly status: BillingDisputeStatus;
  readonly createdAt: string;
  readonly reviewNotes: string | null;
  readonly resolution: string | null;
  readonly resolvedAt: string | null;
}
