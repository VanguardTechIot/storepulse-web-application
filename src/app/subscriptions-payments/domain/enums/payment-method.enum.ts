/**
 * Means of payment accepted by the payment gateway.
 * The value doubles as the i18n key suffix (`subscriptions.payment_methods.<method>`).
 */
export enum PaymentMethod {
  CreditCard = 'CREDIT_CARD',
  DebitCard = 'DEBIT_CARD',
  BankTransfer = 'BANK_TRANSFER',
}
