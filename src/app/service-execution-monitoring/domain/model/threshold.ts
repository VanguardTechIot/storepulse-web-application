export type ComparisonOperator =
  | 'GREATER_THAN'
  | 'GREATER_THAN_OR_EQUAL'
  | 'LESS_THAN'
  | 'LESS_THAN_OR_EQUAL'
  | 'EQUAL';

const OPERATOR_SYMBOLS: Record<ComparisonOperator, string> = {
  GREATER_THAN: '>',
  GREATER_THAN_OR_EQUAL: '≥',
  LESS_THAN: '<',
  LESS_THAN_OR_EQUAL: '≤',
  EQUAL: '=',
};

/**
 * Value object: limit value and comparison operator used to evaluate a measurement.
 */
export class Threshold {
  constructor(
    readonly value: number,
    readonly operator: ComparisonOperator,
  ) {}

  get symbol(): string {
    return OPERATOR_SYMBOLS[this.operator];
  }

  evaluate(value: number): boolean {
    switch (this.operator) {
      case 'GREATER_THAN':
        return value > this.value;
      case 'GREATER_THAN_OR_EQUAL':
        return value >= this.value;
      case 'LESS_THAN':
        return value < this.value;
      case 'LESS_THAN_OR_EQUAL':
        return value <= this.value;
      case 'EQUAL':
        return value === this.value;
    }
  }
}
