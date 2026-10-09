import { BaseEntity } from '../../../shared/domain/model/base-entity';
import { BillingCycle } from './billing-cycle.enum';
import { Money } from './money.value-object';
import { PaymentMethod } from './payment-method.enum';
import { PaymentStatus } from './payment-status.enum';

/**
 * Aggregate root: charge that supports a subscription. Immutable once the gateway resolves it.
 */
export class Payment implements BaseEntity {
  constructor(
    readonly id: string,
    readonly subscriptionId: string,
    /** Receipt issued for an accepted charge, e.g. `F001-000318`. */
    readonly receiptNumber: string | null,
    readonly planId: string,
    readonly billingCycle: BillingCycle,
    readonly amount: Money,
    readonly method: PaymentMethod,
    readonly methodLabel: string,
    readonly status: PaymentStatus,
    /** Transaction id returned by the gateway (GatewayReference). */
    readonly gatewayReference: string | null,
    readonly registeredAt: Date,
  ) {}

  get isAccepted(): boolean {
    return this.status === PaymentStatus.Accepted;
  }

  get isRejected(): boolean {
    return this.status === PaymentStatus.Rejected;
  }
}
