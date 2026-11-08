import { BillingDisputeStatus } from '../enums/billing-dispute-status.enum';
import { DisputeReason } from '../enums/dispute-reason.enum';
import { BillingDispute } from './billing-dispute.entity';
import { BillingErrorCode } from './billing-error';

function billingDispute(status: BillingDisputeStatus): BillingDispute {
  return BillingDispute.restore({
    id: '2',
    utilityBillId: '1',
    tenantId: 'usr-002',
    reason: DisputeReason.ConsumptionAboveBaseline,
    description: 'Consumo alto',
    status,
    reviewNotes: null,
    resolution: null,
    createdAt: new Date('2026-10-07T15:24:00Z'),
    resolvedAt: null,
  });
}

describe('BillingDispute', () => {
  it('moves an open dispute to review, with optional notes', () => {
    const reviewed = billingDispute(BillingDisputeStatus.Open).review('  ');

    expect(reviewed.status).toBe(BillingDisputeStatus.UnderReview);
    expect(reviewed.reviewNotes).toBeNull();
  });

  it('reviews only an open dispute', () => {
    expect(() => billingDispute(BillingDisputeStatus.UnderReview).review('')).toThrowError(
      BillingErrorCode.InvalidTransition,
    );
  });

  it('needs a resolution and cannot be resolved twice', () => {
    const open = billingDispute(BillingDisputeStatus.Open);

    expect(() => open.resolve(' ')).toThrowError(BillingErrorCode.ResolutionRequired);
    expect(() => open.resolve('x'.repeat(1001))).toThrowError(BillingErrorCode.TextTooLong);
    const resolved = open.resolve(' Lectura confirmada ');
    expect(resolved.resolution).toBe('Lectura confirmada');
    expect(resolved.isOpen).toBe(false);
    expect(() => resolved.resolve('otra')).toThrowError(BillingErrorCode.DisputeClosed);
  });
});
