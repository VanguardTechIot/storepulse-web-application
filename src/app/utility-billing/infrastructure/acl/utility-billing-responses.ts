import { BillingDisputeStatus } from '../../domain/enums/billing-dispute-status.enum';
import { DisputeReason } from '../../domain/enums/dispute-reason.enum';
import { UtilityBillStatus } from '../../domain/enums/utility-bill-status.enum';
import { UtilityType } from '../../domain/enums/utility-type.enum';

/** Identifier as the platform writes it: numeric in the REST API, text in the local data server. */
export type ResourceId = number | string;

export interface BillingItemResource {
  utilityType: UtilityType;
  consumption: number;
  baseline: number;
  unitOfMeasure: string;
  rate: number;
  amount: number;
}

export interface UtilityBillResource {
  id: ResourceId;
  code: string;
  unitId: ResourceId;
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

export interface GenerateUtilityBillResource {
  unitId: ResourceId;
  unitCode: string;
  unitName: string;
  tenantName: string;
  /** Month as `yyyy-MM`. */
  period: string;
}

export interface VerifyBillingDataResource {
  acceptIncompleteData: boolean;
}

export interface BillingDisputeResource {
  id: ResourceId;
  utilityBillId: ResourceId;
  tenantId: ResourceId;
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
