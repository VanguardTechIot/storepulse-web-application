export type UtilityType = 'WATER' | 'ELECTRICITY';

export type UtilityBillStatus = 'DRAFT' | 'DATA_VERIFIED' | 'ISSUED' | 'IN_DISPUTE' | 'RESOLVED';

export interface BillingPeriod {
  /** Fecha (yyyy-mm-dd) del primer día del periodo. */
  readonly start: string;
  /** Fecha (yyyy-mm-dd) del último día del periodo. */
  readonly end: string;
}

export interface BillingItem {
  readonly id: string;
  readonly utilityType: UtilityType;
  readonly consumption: number;
  readonly baseline: number;
  readonly unitOfMeasure: 'm³' | 'kWh';
  readonly rate: number;
  readonly amount: number;
}

export interface UtilityBill {
  readonly id: string;
  readonly code: string;
  readonly unitId: string;
  readonly unitCode: string;
  readonly unitName: string;
  readonly tenantName: string;
  readonly period: BillingPeriod;
  readonly status: UtilityBillStatus;
  readonly items: readonly BillingItem[];
  readonly totalAmount: number;
  /** Porcentaje (0-100) de lecturas recibidas para el periodo. */
  readonly dataCompleteness: number;
  /** Indica si el administrador emitió la factura aceptando datos incompletos. */
  readonly dataWarningAccepted: boolean;
  readonly issuedAt: string | null;
  readonly dueDate: string | null;
}

export interface UnitOption {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly tenantName: string;
}

/** Consumo recibido desde Dashboard and Analytics (ACL de Utility Billing). */
export interface UtilityConsumption {
  readonly utilityType: UtilityType;
  readonly unitOfMeasure: 'm³' | 'kWh';
  readonly consumption: number;
  readonly baseline: number;
  readonly rate: number;
  readonly expectedReadings: number;
  readonly receivedReadings: number;
}

export interface ConsumptionSummary {
  readonly unitId: string;
  readonly period: BillingPeriod;
  readonly utilities: readonly UtilityConsumption[];
}
