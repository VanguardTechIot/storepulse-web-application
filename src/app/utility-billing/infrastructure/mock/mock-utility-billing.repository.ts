import { BillingDispute } from '../../domain/model/billing-dispute.model';
import {
  BillingPeriod,
  ConsumptionSummary,
  UnitOption,
  UtilityBill,
  UtilityBillStatus,
  UtilityConsumption,
} from '../../domain/model/utility-bill.model';
import {
  createDraftBill,
  dueDateFrom,
  periodFromMonth,
} from '../../domain/model/billing-rules';
import { UtilityBillingRepository } from '../../domain/repository/utility-billing.repository';

const WATER_RATE = 4.2;
const ELECTRICITY_RATE = 0.78;
const SEPTEMBER = periodFromMonth('2026-09');
const ISSUED_AT = '2026-10-01T08:00:00.000Z';

const UNITS: UnitOption[] = [
  { id: 'unit-b12', code: 'B-12', name: 'Ópticas Visión', tenantName: 'Ópticas Visión S.A.C.' },
  { id: 'unit-a03', code: 'A-03', name: 'Calzados Roma', tenantName: 'Calzados Roma S.A.C.' },
  { id: 'unit-c03', code: 'C-03', name: 'Comida Rápida Max', tenantName: 'Max Food E.I.R.L.' },
  { id: 'unit-c07', code: 'C-07', name: 'Joyería Lumen', tenantName: 'Lumen Joyas S.A.C.' },
  { id: 'unit-a01', code: 'A-01', name: 'Café Andino', tenantName: 'Café Andino S.R.L.' },
];

interface UnitProfile {
  readonly waterBaseline: number;
  readonly electricityBaseline: number;
  readonly waterFactor: number;
  readonly electricityFactor: number;
  readonly receivedReadings: number;
}

/** Perfil de consumo simulado por local (Dashboard and Analytics). */
const PROFILES: Record<string, UnitProfile> = {
  'unit-b12': { waterBaseline: 38, electricityBaseline: 600, waterFactor: 1.05, electricityFactor: 1.0, receivedReadings: 30 },
  'unit-a03': { waterBaseline: 28, electricityBaseline: 950, waterFactor: 1.25, electricityFactor: 1.45, receivedReadings: 30 },
  'unit-c03': { waterBaseline: 55, electricityBaseline: 1900, waterFactor: 1.06, electricityFactor: 1.1, receivedReadings: 30 },
  'unit-c07': { waterBaseline: 22, electricityBaseline: 520, waterFactor: 0.95, electricityFactor: 1.04, receivedReadings: 26 },
  'unit-a01': { waterBaseline: 18, electricityBaseline: 390, waterFactor: 1.0, electricityFactor: 1.0, receivedReadings: 30 },
};

function buildSummary(unitId: string, period: BillingPeriod): ConsumptionSummary {
  const profile = PROFILES[unitId];
  if (!profile) {
    throw new Error('billing.errors.unit_not_found');
  }
  const utilities: UtilityConsumption[] = [
    {
      utilityType: 'WATER',
      unitOfMeasure: 'm³',
      consumption: Math.round(profile.waterBaseline * profile.waterFactor * 10) / 10,
      baseline: profile.waterBaseline,
      rate: WATER_RATE,
      expectedReadings: 30,
      receivedReadings: profile.receivedReadings,
    },
    {
      utilityType: 'ELECTRICITY',
      unitOfMeasure: 'kWh',
      consumption: Math.round(profile.electricityBaseline * profile.electricityFactor * 10) / 10,
      baseline: profile.electricityBaseline,
      rate: ELECTRICITY_RATE,
      expectedReadings: 30,
      receivedReadings: profile.receivedReadings,
    },
  ];
  return { unitId, period, utilities };
}

function seedBill(unitId: string, status: UtilityBillStatus, issued = false): UtilityBill {
  const unit = UNITS.find((u) => u.id === unitId);
  if (!unit) {
    throw new Error('billing.errors.unit_not_found');
  }
  const draft = createDraftBill({
    id: `bill-2026-09-${unit.code.replace('-', '').toLowerCase()}`,
    unit,
    period: SEPTEMBER,
    summary: buildSummary(unitId, SEPTEMBER),
  });
  if (!issued) {
    return { ...draft, status };
  }
  const issuedDate = new Date(ISSUED_AT);
  return { ...draft, status, issuedAt: issuedDate.toISOString(), dueDate: dueDateFrom(issuedDate) };
}

function seedBills(): UtilityBill[] {
  return [
    seedBill('unit-b12', 'IN_DISPUTE', true),
    seedBill('unit-a03', 'ISSUED', true),
    seedBill('unit-c03', 'DATA_VERIFIED'),
    seedBill('unit-c07', 'DRAFT'),
    seedBill('unit-a01', 'RESOLVED', true),
  ];
}

function seedDisputes(): BillingDispute[] {
  return [
    {
      id: 'dispute-rec-0024',
      code: 'REC-0024',
      billId: 'bill-2026-09-b12',
      tenantName: 'Ópticas Visión S.A.C.',
      reason: 'CONSUMPTION_ABOVE_BASELINE',
      description:
        'El consumo de agua del periodo supera la línea base del local. Solicitamos revisar la lectura del medidor.',
      status: 'OPEN',
      createdAt: '2026-10-07T10:24:00.000Z',
      reviewNotes: null,
      resolution: null,
      resolvedAt: null,
    },
    {
      id: 'dispute-rec-0019',
      code: 'REC-0019',
      billId: 'bill-2026-09-a01',
      tenantName: 'Café Andino S.R.L.',
      reason: 'METER_READING',
      description: 'La lectura de agua reportada no coincide con la lectura física del medidor.',
      status: 'RESOLVED',
      createdAt: '2026-10-02T15:10:00.000Z',
      reviewNotes: 'Lectura verificada con el técnico.',
      resolution: 'Lectura corregida. Factura ajustada.',
      resolvedAt: '2026-10-03T09:00:00.000Z',
    },
  ];
}

export class MockUtilityBillingRepository implements UtilityBillingRepository {
  private bills: UtilityBill[] = seedBills();
  private disputes: BillingDispute[] = seedDisputes();

  async listBills(): Promise<UtilityBill[]> {
    return structuredClone(this.bills);
  }

  async saveBill(bill: UtilityBill): Promise<void> {
    const copy = structuredClone(bill);
    const exists = this.bills.some((b) => b.id === bill.id);
    this.bills = exists
      ? this.bills.map((b) => (b.id === bill.id ? copy : b))
      : [copy, ...this.bills];
  }

  async listDisputes(): Promise<BillingDispute[]> {
    return structuredClone(this.disputes);
  }

  async saveDispute(dispute: BillingDispute): Promise<void> {
    const copy = structuredClone(dispute);
    const exists = this.disputes.some((d) => d.id === dispute.id);
    this.disputes = exists
      ? this.disputes.map((d) => (d.id === dispute.id ? copy : d))
      : [copy, ...this.disputes];
  }

  async listUnits(): Promise<UnitOption[]> {
    return structuredClone(UNITS);
  }

  async getConsumptionSummary(unitId: string, period: BillingPeriod): Promise<ConsumptionSummary> {
    return structuredClone(buildSummary(unitId, period));
  }
}
