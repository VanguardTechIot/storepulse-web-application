import { BillingMonth } from '../value-objects/billing-month.value-object';
import { UnitReference } from './unit-reference';

/** Asks the platform for the draft bill of a unit; it computes the breakdown from the consumption. */
export interface GenerateUtilityBillCommand {
  readonly unit: UnitReference;
  readonly period: BillingMonth;
}
