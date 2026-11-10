import { UtilityBillStatus } from '../enums/utility-bill-status.enum';
import { UtilityType } from '../enums/utility-type.enum';
import { BillingItem } from '../value-objects/billing-item.value-object';
import { BillingMonth } from '../value-objects/billing-month.value-object';
import { BillingErrorCode } from './billing-error';
import { UtilityBill } from './utility-bill.entity';

function utilityBill(status: UtilityBillStatus, dataCompleteness = 100): UtilityBill {
  return UtilityBill.restore({
    id: '1',
    code: 'FAC-202609-B12',
    unitId: 'res-b12',
    unitCode: 'B-12',
    unitName: 'Local B-12',
    tenantName: 'Ópticas Visión',
    period: new BillingMonth('2026-09'),
    status,
    items: [
      new BillingItem(UtilityType.Water, 3.3, 3.233, 'm³', 4.2, 13.86),
      new BillingItem(UtilityType.Electricity, 360, 279.6, 'kWh', 0.78, 280.8),
    ],
    totalAmount: 294.66,
    dataCompleteness,
    dataWarningAccepted: false,
    issuedAt: null,
    dueDate: null,
  });
}

describe('UtilityBill', () => {
  it('flags only the items more than 20 % above the baseline', () => {
    const bill = utilityBill(UtilityBillStatus.Draft);

    expect(bill.exceededItems.map((item) => item.utilityType)).toEqual([UtilityType.Electricity]);
  });

  it('verifies a draft with complete data', () => {
    const verified = utilityBill(UtilityBillStatus.Draft).verifyData(false);

    expect(verified.status).toBe(UtilityBillStatus.DataVerified);
    expect(verified.dataWarningAccepted).toBe(false);
  });

  it('needs the explicit acceptance to verify incomplete data', () => {
    const bill = utilityBill(UtilityBillStatus.Draft, 50);

    expect(() => bill.verifyData(false)).toThrowError(BillingErrorCode.IncompleteDataNotAccepted);
    expect(bill.verifyData(true).dataWarningAccepted).toBe(true);
  });

  it('issues only a verified bill', () => {
    expect(utilityBill(UtilityBillStatus.DataVerified).issue().status).toBe(
      UtilityBillStatus.Issued,
    );
    expect(() => utilityBill(UtilityBillStatus.Draft).issue()).toThrowError(
      BillingErrorCode.InvalidTransition,
    );
  });
});
