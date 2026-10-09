import { ValidatorFn } from '@angular/forms';
import { PaymentCard } from '../domain/model/payment-card.value-object';

/** Form validators backed by the domain rules, so the UI and the model never disagree. */
export const cardNumberValidator: ValidatorFn = (control) =>
  !control.value || /^\d{13,19}$/.test(String(control.value).replace(/\s+/g, ''))
    ? null
    : { cardNumber: true };

export const cardExpiryValidator: ValidatorFn = (control) =>
  !control.value || PaymentCard.isExpiryValid(control.value) ? null : { cardExpiry: true };
