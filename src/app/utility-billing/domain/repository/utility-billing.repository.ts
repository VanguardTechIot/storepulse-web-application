import { BillingDispute } from '../model/billing-dispute.model';
import {
  BillingPeriod,
  ConsumptionSummary,
  UnitOption,
  UtilityBill,
} from '../model/utility-bill.model';

/** Abstracción de persistencia del contexto Utility Billing. */
export interface UtilityBillingRepository {
  listBills(): Promise<UtilityBill[]>;
  saveBill(bill: UtilityBill): Promise<void>;
  listDisputes(): Promise<BillingDispute[]>;
  saveDispute(dispute: BillingDispute): Promise<void>;
  listUnits(): Promise<UnitOption[]>;
  getConsumptionSummary(unitId: string, period: BillingPeriod): Promise<ConsumptionSummary>;
}
