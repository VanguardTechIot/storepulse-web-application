/**
 * Lifecycle of a tenant invitation (US-12). `Expired` is never stored: a pending invitation
 * becomes expired when its 7 days pass.
 */
export enum InvitationStatus {
  Pending = 'PENDING',
  Accepted = 'ACCEPTED',
  Revoked = 'REVOKED',
  Expired = 'EXPIRED',
}
