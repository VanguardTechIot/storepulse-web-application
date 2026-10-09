import { BaseEntity } from '../../../shared/domain/model/base-entity';
import { ConsumptionValue } from './consumption-value.value-object';
import { UtilityType } from './utility-type.enum';

/**
 * Aggregate root: consumption of water or electricity recorded by a utility meter for a period
 * and confirmed by the provider (Sedapal or Luz del Sur).
 */
export class ConsumptionRegistration implements BaseEntity {
  constructor(
    readonly id: string,
    /** External reference to Resource and Asset Management. */
    readonly meterId: string,
    readonly utilityType: UtilityType,
    readonly value: ConsumptionValue,
    /** `YYYY-MM`. */
    readonly period: string,
    readonly capturedAt: Date,
  ) {}

  get year(): number {
    return Number(this.period.slice(0, 4));
  }

  /** 1 to 12. */
  get month(): number {
    return Number(this.period.slice(5, 7));
  }
}
