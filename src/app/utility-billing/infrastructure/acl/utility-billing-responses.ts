import { BillingDisputeStatus } from '../../domain/enums/billing-dispute-status.enum';
import { DisputeReason } from '../../domain/enums/dispute-reason.enum';
import { UtilityBillStatus } from '../../domain/enums/utility-bill-status.enum';
import { UtilityType } from '../../domain/enums/utility-type.enum';

export interface BillingItemResource {
  utilityType: UtilityType;
  consumption: number;
  baseline: number;
  unitOfMeasure: string;
  rate: number;
  amount: number;
}

export interface UtilityBillResource {
  id: number;
  code: string;
  unitId: number;
  unitCode: string;
  unitName: string | null;
  tenantName: string | null;
  /** First and last day of the month, as `yyyy-MM-dd`. */
  periodStart: string;
  periodEnd: string;
  status: UtilityBillStatus;
  items: BillingItemResource[];
  totalAmount: number;
  dataCompleteness: number;
  dataWarningAccepted: boolean;
  issuedAt: string | null;
  /** Date only, as `yyyy-MM-dd`. */
  dueDate: string | null;
}

/** Body of `POST /utility-bills`: the platform reads the unit, its tenant and its consumption. */
export interface GenerateUtilityBillResource {
  unitId: number;
  /** Month as `yyyy-MM`. */
  period: string;
}

export interface VerifyBillingDataResource {
  acceptIncompleteData: boolean;
}

export interface BillingDisputeResource {
  id: number;
  utilityBillId: number;
  tenantId: number;
  reason: DisputeReason;
  description: string | null;
  status: BillingDisputeStatus;
  reviewNotes: string | null;
  resolution: string | null;
  createdAt: string;
  resolvedAt: string | null;
}

export interface ReviewBillingDisputeResource {
  reviewNotes: string;
}

export interface ResolveBillingDisputeResource {
  resolution: string;
}
