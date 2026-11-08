import { BillingDispute } from '../model/billing-dispute.entity';
import { GenerateUtilityBillCommand } from '../model/generate-utility-bill.command';
import { UtilityBill } from '../model/utility-bill.entity';

/**
 * Access abstraction of Utility Billing: the bills of the units (`/utility-bills`) and the
 * disputes the tenants raise over them (`/billing-disputes`). Errors are thrown as `BillingError`.
 */
export interface UtilityBillingRepository {
  listBills(): Promise<UtilityBill[]>;
  getBill(billId: string): Promise<UtilityBill>;
  generateBill(command: GenerateUtilityBillCommand): Promise<UtilityBill>;
  verifyBillData(billId: string, acceptIncompleteData: boolean): Promise<UtilityBill>;
  issueBill(billId: string): Promise<UtilityBill>;
  listDisputes(): Promise<BillingDispute[]>;
  reviewDispute(disputeId: string, reviewNotes: string): Promise<BillingDispute>;
  resolveDispute(disputeId: string, resolution: string): Promise<BillingDispute>;
}
