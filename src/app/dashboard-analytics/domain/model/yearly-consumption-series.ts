/** Monthly totals of one utility for one year; `null` for months without data. */
export interface YearlyConsumptionSeries {
  year: number;
  unit: string;
  values: (number | null)[];
}
