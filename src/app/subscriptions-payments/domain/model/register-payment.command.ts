import { BillingCycle } from './billing-cycle.enum';
import { Money } from './money.value-object';
import { PaymentCard } from './payment-card.value-object';
import { PaymentMethod } from './payment-method.enum';

/**
 * Charge sent to the payment gateway for a subscription (TS-27).
 */
export class RegisterPaymentCommand {
  readonly subscriptionId: string;
  readonly planId: string;
  readonly billingCycle: BillingCycle;
  readonly amount: Money;
  readonly method: PaymentMethod;
  readonly card: PaymentCard;

  constructor(command: {
    subscriptionId: string;
    planId: string;
    billingCycle: BillingCycle;
    amount: Money;
    method: PaymentMethod;
    card: PaymentCard;
  }) {
    this.subscriptionId = command.subscriptionId;
    this.planId = command.planId;
    this.billingCycle = command.billingCycle;
    this.amount = command.amount;
    this.method = command.method;
    this.card = command.card;
  }
}
