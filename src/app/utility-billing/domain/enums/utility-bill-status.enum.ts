/** Life cycle of a bill: its data is verified, it is issued and, after a dispute, resolved. */
export enum UtilityBillStatus {
  Draft = 'DRAFT',
  DataVerified = 'DATA_VERIFIED',
  Issued = 'ISSUED',
  InDispute = 'IN_DISPUTE',
  Resolved = 'RESOLVED',
}
