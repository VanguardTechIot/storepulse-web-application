import { BillingCycle } from './billing-cycle.enum';
import { PaymentMethod } from './payment-method.enum';

/**
 * Contracts (or changes to) a plan and pays it in the same step (US-44, mock-up 11a).
 */
export class RequestSubscriptionCommand {
  readonly planId: string;
  readonly billingCycle: BillingCycle;
  readonly paymentMethod: PaymentMethod;
  readonly cardNumber: string;
  /** `MM/YY`. */
  readonly cardExpiry: string;

  constructor(command: {
    planId: string;
    billingCycle: BillingCycle;
    paymentMethod: PaymentMethod;
    cardNumber: string;
    cardExpiry: string;
  }) {
    this.planId = command.planId;
    this.billingCycle = command.billingCycle;
    this.paymentMethod = command.paymentMethod;
    this.cardNumber = command.cardNumber;
    this.cardExpiry = command.cardExpiry;
  }
}
