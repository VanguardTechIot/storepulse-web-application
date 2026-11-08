import { computed, inject, Injectable, signal } from '@angular/core';
import { UtilityBillStatus } from '../domain/enums/utility-bill-status.enum';
import { BillingDispute } from '../domain/model/billing-dispute.entity';
import { BillingError, BillingErrorCode } from '../domain/model/billing-error';
import { UnitReference } from '../domain/model/unit-reference';
import { UtilityBill } from '../domain/model/utility-bill.entity';
import { BillingMonth } from '../domain/value-objects/billing-month.value-object';
import { ResourceAssetContextFacade } from '../infrastructure/acl/resource-asset-context-facade';
import { UTILITY_BILLING_REPOSITORY } from '../infrastructure/repositories/utility-billing.token';

type LoadStatus = 'idle' | 'loading' | 'loaded' | 'error';

/**
 * Application service of Utility Billing for the gallery administrator: bills, their breakdown
 * and the disputes the tenants raise over them.
 *
 * Commands resolve to the updated entity when they succeed; on failure they resolve to `null` and
 * expose the reason in `error` (a `BillingErrorCode`, translated as `billing.errors.<code>`).
 */
@Injectable({ providedIn: 'root' })
export class UtilityBillingStore {
  private readonly repository = inject(UTILITY_BILLING_REPOSITORY);
  private readonly resourceAssetContext = inject(ResourceAssetContextFacade);

  private readonly status = signal<LoadStatus>('idle');
  /** True once the data has been loaded at least once; later refreshes keep showing it. */
  readonly ready = signal(false);
  readonly isLoading = computed(() => this.status() === 'loading' || this.status() === 'idle');
  readonly hasError = computed(() => this.status() === 'error');
  readonly processing = signal(false);
  readonly error = signal<BillingErrorCode | null>(null);

  private readonly billsState = signal<UtilityBill[]>([]);
  private readonly disputesState = signal<BillingDispute[]>([]);
  private readonly unitsState = signal<UnitReference[]>([]);

  /** Most recent period first. */
  readonly bills = computed(() =>
    [...this.billsState()].sort(
      (a, b) =>
        b.period.value.localeCompare(a.period.value) || a.unitCode.localeCompare(b.unitCode),
    ),
  );
  /** Most recent first. */
  readonly disputes = computed(() =>
    [...this.disputesState()].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
  );
  readonly units = this.unitsState.asReadonly();

  readonly openDisputes = computed(() => this.disputesState().filter((d) => d.isOpen));
  /** Amount already billed to the tenants. */
  readonly issuedAmount = computed(
    () =>
      Math.round(
        this.billsState()
          .filter((bill) => bill.isIssued)
          .reduce((sum, bill) => sum + bill.totalAmount, 0) * 100,
      ) / 100,
  );

  countByStatus(status: UtilityBillStatus | null): number {
    return this.billsState().filter((bill) => status === null || bill.status === status).length;
  }

  findBill(billId: string): UtilityBill | undefined {
    return this.billsState().find((bill) => bill.id === billId);
  }

  findDispute(disputeId: string): BillingDispute | undefined {
    return this.disputesState().find((dispute) => dispute.id === disputeId);
  }

  disputesOf(billId: string): BillingDispute[] {
    return this.disputes().filter((dispute) => dispute.utilityBillId === billId);
  }

  // ---------- Queries ----------
  /** Loads the bills, the disputes and the units. Rejects when the platform cannot be reached. */
  async load(force = false): Promise<void> {
    if (!force && (this.status() === 'loaded' || this.status() === 'loading')) return;
    this.status.set('loading');
    try {
      const [bills, disputes, units] = await Promise.all([
        this.repository.listBills(),
        this.repository.listDisputes(),
        this.resourceAssetContext.listUnits(),
      ]);
      this.billsState.set(bills);
      this.disputesState.set(disputes);
      this.unitsState.set(units);
      this.status.set('loaded');
      this.ready.set(true);
    } catch (error) {
      this.status.set('error');
      throw error;
    }
  }

  // ---------- Commands ----------
  generate(unit: UnitReference, period: BillingMonth): Promise<UtilityBill | null> {
    return this.execute(async () => {
      const duplicated = this.billsState().some(
        (bill) => bill.unitId === unit.id && bill.period.equals(period),
      );
      if (duplicated) throw new BillingError(BillingErrorCode.Duplicate);
      const generated = await this.repository.generateBill({ unit, period });
      this.billsState.update((all) => [generated, ...all]);
      return generated;
    });
  }

  verifyData(bill: UtilityBill, acceptIncompleteData: boolean): Promise<UtilityBill | null> {
    return this.execute(async () => {
      bill.verifyData(acceptIncompleteData);
      return this.replaceBill(await this.repository.verifyBillData(bill.id, acceptIncompleteData));
    });
  }

  issue(bill: UtilityBill): Promise<UtilityBill | null> {
    return this.execute(async () => {
      bill.issue();
      return this.replaceBill(await this.repository.issueBill(bill.id));
    });
  }

  review(dispute: BillingDispute, reviewNotes: string): Promise<BillingDispute | null> {
    return this.execute(async () => {
      const reviewed = dispute.review(reviewNotes);
      return this.replaceDispute(
        await this.repository.reviewDispute(dispute.id, reviewed.reviewNotes ?? ''),
      );
    });
  }

  /** Closing the last open dispute resolves the bill, so the bill is read again. */
  resolve(dispute: BillingDispute, resolution: string): Promise<BillingDispute | null> {
    return this.execute(async () => {
      const resolved = dispute.resolve(resolution);
      const updated = this.replaceDispute(
        await this.repository.resolveDispute(dispute.id, resolved.resolution ?? ''),
      );
      this.replaceBill(await this.repository.getBill(dispute.utilityBillId));
      return updated;
    });
  }

  clearError(): void {
    this.error.set(null);
  }

  private replaceBill(updated: UtilityBill): UtilityBill {
    this.billsState.update((all) => all.map((b) => (b.id === updated.id ? updated : b)));
    return updated;
  }

  private replaceDispute(updated: BillingDispute): BillingDispute {
    this.disputesState.update((all) => all.map((d) => (d.id === updated.id ? updated : d)));
    return updated;
  }

  private async execute<T>(operation: () => Promise<T>): Promise<T | null> {
    this.processing.set(true);
    this.error.set(null);
    try {
      return await operation();
    } catch (error) {
      this.error.set(error instanceof BillingError ? error.code : BillingErrorCode.Unexpected);
      return null;
    } finally {
      this.processing.set(false);
    }
  }
}
