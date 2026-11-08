/** Commercial unit a bill is generated for, as Utility Billing knows it. */
export interface UnitReference {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly tenantName: string;
}
