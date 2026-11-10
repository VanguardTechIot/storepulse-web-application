import { BaseEntity } from '../../../shared/domain/model/base-entity';
import { BillingDisputeStatus } from '../enums/billing-dispute-status.enum';
import { DisputeReason } from '../enums/dispute-reason.enum';
import { BillingError, BillingErrorCode } from './billing-error';

/** Longest review note or resolution accepted by the platform. */
export const DISPUTE_TEXT_MAX_LENGTH = 1000;

export interface BillingDisputeProps {
  id: string;
  utilityBillId: string;
  tenantId: string;
  reason: DisputeReason;
  description: string;
  status: BillingDisputeStatus;
  reviewNotes: string | null;
  resolution: string | null;
  createdAt: Date;
  resolvedAt: Date | null;
}

/**
 * Tenant's dispute over an issued bill. The administrator reviews it and then resolves it; the
 * bill is resolved once none of its disputes remains open.
 */
export class BillingDispute implements BaseEntity {
  private constructor(private readonly props: BillingDisputeProps) {}

  static restore(props: BillingDisputeProps): BillingDispute {
    return new BillingDispute({ ...props });
  }

  get id(): string {
    return this.props.id;
  }
  get utilityBillId(): string {
    return this.props.utilityBillId;
  }
  get tenantId(): string {
    return this.props.tenantId;
  }
  get reason(): DisputeReason {
    return this.props.reason;
  }
  get description(): string {
    return this.props.description;
  }
  get status(): BillingDisputeStatus {
    return this.props.status;
  }
  get reviewNotes(): string | null {
    return this.props.reviewNotes;
  }
  get resolution(): string | null {
    return this.props.resolution;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get resolvedAt(): Date | null {
    return this.props.resolvedAt;
  }

  get isOpen(): boolean {
    return this.props.status !== BillingDisputeStatus.Resolved;
  }

  /** Checks the move from open to under review; the notes are optional. */
  review(notes: string): BillingDispute {
    if (this.props.status !== BillingDisputeStatus.Open) {
      throw new BillingError(BillingErrorCode.InvalidTransition);
    }
    const reviewNotes = notes.trim();
    if (reviewNotes.length > DISPUTE_TEXT_MAX_LENGTH) {
      throw new BillingError(BillingErrorCode.TextTooLong);
    }
    return new BillingDispute({
      ...this.props,
      status: BillingDisputeStatus.UnderReview,
      reviewNotes: reviewNotes || null,
    });
  }

  /** Checks that the dispute can be closed with the given resolution. */
  resolve(text: string, at: Date = new Date()): BillingDispute {
    if (this.props.status === BillingDisputeStatus.Resolved) {
      throw new BillingError(BillingErrorCode.DisputeClosed);
    }
    const resolution = text.trim();
    if (!resolution) throw new BillingError(BillingErrorCode.ResolutionRequired);
    if (resolution.length > DISPUTE_TEXT_MAX_LENGTH) {
      throw new BillingError(BillingErrorCode.TextTooLong);
    }
    return new BillingDispute({
      ...this.props,
      status: BillingDisputeStatus.Resolved,
      resolution,
      resolvedAt: at,
    });
  }
}
