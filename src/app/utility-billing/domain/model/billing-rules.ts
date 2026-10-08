import { BillingDispute } from './billing-dispute.model';
import {
  BillingItem,
  BillingPeriod,
  ConsumptionSummary,
  UnitOption,
  UtilityBill,
  UtilityBillStatus,
  UtilityConsumption,
} from './utility-bill.model';

/** Desviación sobre la línea base a partir de la cual se advierte al administrador. */
export const BASELINE_ALERT_THRESHOLD = 0.2;

export const FULL_DATA_COMPLETENESS = 100;

export const PAYMENT_TERM_DAYS = 15;

export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function calculateAmount(consumption: number, rate: number): number {
  return round2(consumption * rate);
}

export function calculateTotal(items: readonly BillingItem[]): number {
  return round2(items.reduce((sum, item) => sum + item.amount, 0));
}

export function calculateCompleteness(utilities: readonly UtilityConsumption[]): number {
  const expected = utilities.reduce((sum, u) => sum + u.expectedReadings, 0);
  const received = utilities.reduce((sum, u) => sum + u.receivedReadings, 0);
  return expected === 0 ? 0 : Math.round((received / expected) * 100);
}

export function buildBillItems(utilities: readonly UtilityConsumption[]): BillingItem[] {
  return utilities.map((u) => ({
    id: u.utilityType,
    utilityType: u.utilityType,
    consumption: u.consumption,
    baseline: u.baseline,
    unitOfMeasure: u.unitOfMeasure,
    rate: u.rate,
    amount: calculateAmount(u.consumption, u.rate),
  }));
}

/** Variación relativa frente a la línea base (0.25 = 25 % por encima). */
export function varianceRatio(item: Pick<BillingItem, 'consumption' | 'baseline'>): number {
  return item.baseline === 0 ? 0 : (item.consumption - item.baseline) / item.baseline;
}

export function exceedsBaseline(item: Pick<BillingItem, 'consumption' | 'baseline'>): boolean {
  return varianceRatio(item) > BASELINE_ALERT_THRESHOLD;
}

export function canVerifyData(status: UtilityBillStatus): boolean {
  return status === 'DRAFT';
}

export function canIssue(status: UtilityBillStatus): boolean {
  return status === 'DATA_VERIFIED';
}

export function createDraftBill(params: {
  id: string;
  unit: UnitOption;
  period: BillingPeriod;
  summary: ConsumptionSummary;
}): UtilityBill {
  const items = buildBillItems(params.summary.utilities);
  const monthCode = params.period.start.slice(0, 7).replace('-', '');
  return {
    id: params.id,
    code: `FAC-${monthCode}-${params.unit.code.replace('-', '')}`,
    unitId: params.unit.id,
    unitCode: params.unit.code,
    unitName: params.unit.name,
    tenantName: params.unit.tenantName,
    period: params.period,
    status: 'DRAFT',
    items,
    totalAmount: calculateTotal(items),
    dataCompleteness: calculateCompleteness(params.summary.utilities),
    dataWarningAccepted: false,
    issuedAt: null,
    dueDate: null,
  };
}

/** Convierte "2026-10" en el rango de fechas del mes completo. */
export function periodFromMonth(month: string): BillingPeriod {
  const [year, monthNumber] = month.split('-').map(Number);
  const mm = String(monthNumber).padStart(2, '0');
  const lastDay = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  return {
    start: `${year}-${mm}-01`,
    end: `${year}-${mm}-${String(lastDay).padStart(2, '0')}`,
  };
}

export function dueDateFrom(issuedAt: Date): string {
  const due = new Date(issuedAt);
  due.setDate(due.getDate() + PAYMENT_TERM_DAYS);
  return due.toISOString().slice(0, 10);
}

export function openDisputesFor(billId: string, disputes: readonly BillingDispute[]): BillingDispute[] {
  return disputes.filter((d) => d.billId === billId && d.status !== 'RESOLVED');
}
