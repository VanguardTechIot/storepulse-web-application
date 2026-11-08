import { BaseEntity } from '../../../shared/domain/model/base-entity';
import { UtilityBillStatus } from '../enums/utility-bill-status.enum';
import { BillingItem } from '../value-objects/billing-item.value-object';
import { BillingMonth } from '../value-objects/billing-month.value-object';
import { BillingError, BillingErrorCode } from './billing-error';

/** Percentage of the expected readings that makes the data of a bill complete. */
export const FULL_DATA_COMPLETENESS = 100;

export interface UtilityBillProps {
  id: string;
  code: string;
  unitId: string;
  unitCode: string;
  unitName: string;
  tenantName: string;
  period: BillingMonth;
  status: UtilityBillStatus;
  items: BillingItem[];
  totalAmount: number;
  dataCompleteness: number;
  dataWarningAccepted: boolean;
  issuedAt: Date | null;
  dueDate: Date | null;
}

/**
 * Water and electricity bill of one unit for one month. The platform computes its breakdown; the
 * administrator verifies its data and then issues it.
 */
export class UtilityBill implements BaseEntity {
  private constructor(private readonly props: UtilityBillProps) {}

  static restore(props: UtilityBillProps): UtilityBill {
    return new UtilityBill({ ...props, items: [...props.items] });
  }

  get id(): string {
    return this.props.id;
  }
  get code(): string {
    return this.props.code;
  }
  get unitId(): string {
    return this.props.unitId;
  }
  get unitCode(): string {
    return this.props.unitCode;
  }
  get unitName(): string {
    return this.props.unitName;
  }
  get tenantName(): string {
    return this.props.tenantName;
  }
  get period(): BillingMonth {
    return this.props.period;
  }
  get status(): UtilityBillStatus {
    return this.props.status;
  }
  get items(): readonly BillingItem[] {
    return this.props.items;
  }
  get totalAmount(): number {
    return this.props.totalAmount;
  }
  get dataCompleteness(): number {
    return this.props.dataCompleteness;
  }
  get dataWarningAccepted(): boolean {
    return this.props.dataWarningAccepted;
  }
  get issuedAt(): Date | null {
    return this.props.issuedAt;
  }
  get dueDate(): Date | null {
    return this.props.dueDate;
  }

  get hasCompleteData(): boolean {
    return this.props.dataCompleteness >= FULL_DATA_COMPLETENESS;
  }

  /** Issued, in dispute or resolved: the tenant already received it. */
  get isIssued(): boolean {
    return (
      this.props.status !== UtilityBillStatus.Draft &&
      this.props.status !== UtilityBillStatus.DataVerified
    );
  }

  get exceededItems(): BillingItem[] {
    return this.props.items.filter((item) => item.exceedsBaseline);
  }

  /** Checks the move from draft to verified; incomplete data needs the explicit acceptance. */
  verifyData(acceptIncompleteData: boolean): UtilityBill {
    if (this.props.status !== UtilityBillStatus.Draft) {
      throw new BillingError(BillingErrorCode.InvalidTransition);
    }
    if (!this.hasCompleteData && !acceptIncompleteData) {
      throw new BillingError(BillingErrorCode.IncompleteDataNotAccepted);
    }
    return new UtilityBill({
      ...this.props,
      status: UtilityBillStatus.DataVerified,
      dataWarningAccepted: !this.hasCompleteData,
    });
  }

  /** Checks the move from verified to issued. */
  issue(): UtilityBill {
    if (this.props.status !== UtilityBillStatus.DataVerified) {
      throw new BillingError(BillingErrorCode.InvalidTransition);
    }
    return new UtilityBill({ ...this.props, status: UtilityBillStatus.Issued });
  }
}
