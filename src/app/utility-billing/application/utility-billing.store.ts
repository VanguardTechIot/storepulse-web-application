import { computed, inject, Injectable, signal } from '@angular/core';
import { BillingDispute } from '../domain/model/billing-dispute.model';
import {
  BillingPeriod,
  ConsumptionSummary,
  UnitOption,
  UtilityBill,
  UtilityBillStatus,
} from '../domain/model/utility-bill.model';
import {
  canIssue,
  canVerifyData,
  createDraftBill,
  dueDateFrom,
  FULL_DATA_COMPLETENESS,
  openDisputesFor,
  round2,
} from '../domain/model/billing-rules';
import { UTILITY_BILLING_REPOSITORY } from '../infrastructure/utility-billing.token';

export interface BillingCounters {
  readonly draft: number;
  readonly verified: number;
  readonly issued: number;
  readonly inDispute: number;
  readonly resolved: number;
  readonly issuedAmount: number;
  readonly openDisputes: number;
}

/**
 * Estado y casos de uso de Utility Billing para el Gallery Administrator.
 * Los errores se lanzan con claves de traducción ('billing.errors.*').
 */
@Injectable({ providedIn: 'root' })
export class UtilityBillingStore {
  private readonly repository = inject(UTILITY_BILLING_REPOSITORY);

  private readonly billsState = signal<UtilityBill[]>([]);
  private readonly disputesState = signal<BillingDispute[]>([]);
  private readonly unitsState = signal<UnitOption[]>([]);
  private loaded = false;

  readonly bills = this.billsState.asReadonly();
  readonly disputes = this.disputesState.asReadonly();
  readonly units = this.unitsState.asReadonly();
  readonly loading = signal(false);
  readonly loadError = signal<string | null>(null);

  readonly counters = computed<BillingCounters>(() => {
    const bills = this.billsState();
    const count = (status: UtilityBillStatus): number => bills.filter((b) => b.status === status).length;
    return {
      draft: count('DRAFT'),
      verified: count('DATA_VERIFIED'),
      issued: count('ISSUED'),
      inDispute: count('IN_DISPUTE'),
      resolved: count('RESOLVED'),
      issuedAmount: round2(
        bills
          .filter((b) => b.status !== 'DRAFT' && b.status !== 'DATA_VERIFIED')
          .reduce((sum, b) => sum + b.totalAmount, 0),
      ),
      openDisputes: this.disputesState().filter((d) => d.status !== 'RESOLVED').length,
    };
  });

  async load(): Promise<void> {
    if (this.loaded) {
      return;
    }
    this.loading.set(true);
    this.loadError.set(null);
    try {
      const [bills, disputes, units] = await Promise.all([
        this.repository.listBills(),
        this.repository.listDisputes(),
        this.repository.listUnits(),
      ]);
      this.billsState.set(bills);
      this.disputesState.set(disputes);
      this.unitsState.set(units);
      this.loaded = true;
    } catch {
      this.loadError.set('billing.errors.load');
    } finally {
      this.loading.set(false);
    }
  }

  findBill(id: string): UtilityBill | undefined {
    return this.billsState().find((b) => b.id === id);
  }

  findDispute(id: string): BillingDispute | undefined {
    return this.disputesState().find((d) => d.id === id);
  }

  disputesForBill(billId: string): BillingDispute[] {
    return this.disputesState().filter((d) => d.billId === billId);
  }

  loadConsumption(unitId: string, period: BillingPeriod): Promise<ConsumptionSummary> {
    return this.repository.getConsumptionSummary(unitId, period);
  }

  async generateBill(unitId: string, period: BillingPeriod): Promise<UtilityBill> {
    const unit = this.unitsState().find((u) => u.id === unitId);
    if (!unit) {
      throw new Error('billing.errors.unit_not_found');
    }
    const duplicated = this.billsState().some(
      (b) => b.unitId === unitId && b.period.start === period.start,
    );
    if (duplicated) {
      throw new Error('billing.errors.duplicate');
    }
    const summary = await this.repository.getConsumptionSummary(unitId, period);
    const bill = createDraftBill({ id: crypto.randomUUID(), unit, period, summary });
    await this.persistBill(bill);
    return bill;
  }

  async verifyData(billId: string, acceptIncompleteData: boolean): Promise<void> {
    const bill = this.requireBill(billId);
    if (!canVerifyData(bill.status)) {
      throw new Error('billing.errors.invalid_transition');
    }
    const incomplete = bill.dataCompleteness < FULL_DATA_COMPLETENESS;
    if (incomplete && !acceptIncompleteData) {
      throw new Error('billing.errors.incomplete_data_not_accepted');
    }
    await this.persistBill({ ...bill, status: 'DATA_VERIFIED', dataWarningAccepted: incomplete });
  }

  async issueBill(billId: string): Promise<void> {
    const bill = this.requireBill(billId);
    if (!canIssue(bill.status)) {
      throw new Error('billing.errors.invalid_transition');
    }
    const issuedAt = new Date();
    await this.persistBill({
      ...bill,
      status: 'ISSUED',
      issuedAt: issuedAt.toISOString(),
      dueDate: dueDateFrom(issuedAt),
    });
  }

  async startDisputeReview(disputeId: string, reviewNotes: string): Promise<void> {
    const dispute = this.requireDispute(disputeId);
    if (dispute.status !== 'OPEN') {
      throw new Error('billing.errors.invalid_transition');
    }
    await this.persistDispute({ ...dispute, status: 'UNDER_REVIEW', reviewNotes: reviewNotes.trim() || null });
  }

  async resolveDispute(disputeId: string, resolution: string): Promise<void> {
    const dispute = this.requireDispute(disputeId);
    if (dispute.status === 'RESOLVED') {
      throw new Error('billing.errors.dispute_closed');
    }
    if (!resolution.trim()) {
      throw new Error('billing.errors.resolution_required');
    }
    await this.persistDispute({
      ...dispute,
      status: 'RESOLVED',
      resolution: resolution.trim(),
      resolvedAt: new Date().toISOString(),
    });

    // La factura vuelve a RESOLVED solo cuando no quedan reclamos abiertos sobre ella.
    const bill = this.findBill(dispute.billId);
    const stillOpen = openDisputesFor(dispute.billId, this.disputesState()).length > 0;
    if (bill && bill.status === 'IN_DISPUTE' && !stillOpen) {
      await this.persistBill({ ...bill, status: 'RESOLVED' });
    }
  }

  private requireBill(billId: string): UtilityBill {
    const bill = this.findBill(billId);
    if (!bill) {
      throw new Error('billing.errors.not_found');
    }
    return bill;
  }

  private requireDispute(disputeId: string): BillingDispute {
    const dispute = this.findDispute(disputeId);
    if (!dispute) {
      throw new Error('billing.errors.not_found');
    }
    return dispute;
  }

  private async persistBill(bill: UtilityBill): Promise<void> {
    await this.repository.saveBill(bill);
    this.billsState.update((list) =>
      list.some((b) => b.id === bill.id)
        ? list.map((b) => (b.id === bill.id ? bill : b))
        : [bill, ...list],
    );
  }

  private async persistDispute(dispute: BillingDispute): Promise<void> {
    await this.repository.saveDispute(dispute);
    this.disputesState.update((list) => list.map((d) => (d.id === dispute.id ? dispute : d)));
  }
}
