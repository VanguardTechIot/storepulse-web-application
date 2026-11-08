import { TestBed } from '@angular/core/testing';
import { BillingDisputeStatus } from '../domain/enums/billing-dispute-status.enum';
import { UtilityBillStatus } from '../domain/enums/utility-bill-status.enum';
import { DisputeReason } from '../domain/enums/dispute-reason.enum';
import { UtilityType } from '../domain/enums/utility-type.enum';
import { BillingDispute } from '../domain/model/billing-dispute.entity';
import { BillingError, BillingErrorCode } from '../domain/model/billing-error';
import { UtilityBill } from '../domain/model/utility-bill.entity';
import { UtilityBillingRepository } from '../domain/repositories/utility-billing.repository';
import { BillingItem } from '../domain/value-objects/billing-item.value-object';
import { BillingMonth } from '../domain/value-objects/billing-month.value-object';
import { ResourceAssetContextFacade } from '../infrastructure/acl/resource-asset-context-facade';
import { UTILITY_BILLING_REPOSITORY } from '../infrastructure/repositories/utility-billing.token';
import { UtilityBillingStore } from './utility-billing.store';

function utilityBill(status: UtilityBillStatus): UtilityBill {
  return UtilityBill.restore({
    id: '1',
    code: 'FAC-202609-B12',
    unitId: 'res-b12',
    unitCode: 'B-12',
    unitName: 'Local B-12',
    tenantName: 'Ópticas Visión',
    period: new BillingMonth('2026-09'),
    status,
    items: [new BillingItem(UtilityType.Water, 3.3, 3.233, 'm³', 4.2, 13.86)],
    totalAmount: 13.86,
    dataCompleteness: 50,
    dataWarningAccepted: true,
    issuedAt: new Date('2026-10-01T13:00:00Z'),
    dueDate: new Date(2026, 9, 16),
  });
}

function billingDispute(status: BillingDisputeStatus): BillingDispute {
  return BillingDispute.restore({
    id: '2',
    utilityBillId: '1',
    tenantId: 'usr-002',
    reason: DisputeReason.Rate,
    description: 'Tarifa',
    status,
    reviewNotes: null,
    resolution: null,
    createdAt: new Date('2026-10-07T15:24:00Z'),
    resolvedAt: null,
  });
}

describe('UtilityBillingStore', () => {
  const unit = { id: 'res-b12', code: 'B-12', name: 'Local B-12', tenantName: 'Ópticas Visión' };

  let repository: { [K in keyof UtilityBillingRepository]: ReturnType<typeof vi.fn> };
  let store: UtilityBillingStore;

  beforeEach(() => {
    repository = {
      listBills: vi.fn(async () => [utilityBill(UtilityBillStatus.InDispute)]),
      getBill: vi.fn(async () => utilityBill(UtilityBillStatus.Resolved)),
      generateBill: vi.fn(),
      verifyBillData: vi.fn(),
      issueBill: vi.fn(async () => utilityBill(UtilityBillStatus.Issued)),
      listDisputes: vi.fn(async () => [billingDispute(BillingDisputeStatus.UnderReview)]),
      reviewDispute: vi.fn(),
      resolveDispute: vi.fn(async () => billingDispute(BillingDisputeStatus.Resolved)),
    };
    TestBed.configureTestingModule({
      providers: [
        { provide: UTILITY_BILLING_REPOSITORY, useValue: repository },
        { provide: ResourceAssetContextFacade, useValue: { listUnits: vi.fn(async () => [unit]) } },
      ],
    });
    store = TestBed.inject(UtilityBillingStore);
  });

  it('loads the bills, the disputes and the units', async () => {
    await store.load();

    expect(store.ready()).toBe(true);
    expect(store.countByStatus(UtilityBillStatus.InDispute)).toBe(1);
    expect(store.openDisputes()).toHaveLength(1);
    expect(store.units()).toEqual([unit]);
    expect(store.issuedAmount()).toBe(13.86);
  });

  it('does not ask for a bill the unit already has for the month', async () => {
    await store.load();

    expect(await store.generate(unit, new BillingMonth('2026-09'))).toBeNull();
    expect(store.error()).toBe(BillingErrorCode.Duplicate);
    expect(repository.generateBill).not.toHaveBeenCalled();
  });

  it('keeps the business code the platform answers', async () => {
    await store.load();
    repository.generateBill.mockRejectedValue(new BillingError(BillingErrorCode.NoConsumptionData));

    expect(await store.generate(unit, new BillingMonth('2026-10'))).toBeNull();
    expect(store.error()).toBe(BillingErrorCode.NoConsumptionData);
  });

  it('checks the life cycle before calling the platform', async () => {
    await store.load();

    expect(await store.issue(store.bills()[0])).toBeNull();
    expect(store.error()).toBe(BillingErrorCode.InvalidTransition);
    expect(repository.issueBill).not.toHaveBeenCalled();
  });

  it('reads the bill again after resolving its dispute', async () => {
    await store.load();

    expect(await store.resolve(store.disputes()[0], 'Lectura confirmada')).not.toBeNull();
    expect(repository.resolveDispute).toHaveBeenCalledWith('2', 'Lectura confirmada');
    expect(store.findBill('1')?.status).toBe(UtilityBillStatus.Resolved);
    expect(store.openDisputes()).toHaveLength(0);
  });
});
