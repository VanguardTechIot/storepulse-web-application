import { BaseEntity } from '../../../shared/domain/model/base-entity';
import { ConsumptionType } from './measurement-type';

const DAY_MS = 24 * 60 * 60 * 1000;

export class Consumption implements BaseEntity {
  constructor(
    readonly id: string,
    readonly resourceId: string,
    readonly measurementType: ConsumptionType,
    readonly totalValue: number,
    readonly unit: string,
    readonly periodStart: Date,
    readonly periodEnd: Date,
  ) {}

  get periodKey(): string {
    return Consumption.periodKeyOf(new Date((this.periodStart.getTime() + this.periodEnd.getTime()) / 2));
  }

  get coveredDays(): number {
    return (this.periodEnd.getTime() - this.periodStart.getTime()) / DAY_MS;
  }

  calculate(): number {
    return this.totalValue;
  }

  get dailyRate(): number {
    return this.coveredDays > 0 ? this.totalValue / this.coveredDays : 0;
  }

  static periodKeyOf(date: Date): string {
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
  }
}
