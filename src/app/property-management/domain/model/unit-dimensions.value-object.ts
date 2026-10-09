/**
 * Floor area of a unit in square meters. Always positive and stored with two decimals.
 */
export class UnitDimensions {
  static readonly maxArea = 10000;

  readonly areaSquareMeters: number;

  constructor(areaSquareMeters: number) {
    if (!UnitDimensions.isValid(areaSquareMeters)) {
      throw new Error(`Invalid area: ${areaSquareMeters}`);
    }
    this.areaSquareMeters = Math.round(areaSquareMeters * 100) / 100;
  }

  static isValid(areaSquareMeters: number): boolean {
    return (
      Number.isFinite(areaSquareMeters) &&
      areaSquareMeters > 0 &&
      areaSquareMeters <= UnitDimensions.maxArea
    );
  }
}
