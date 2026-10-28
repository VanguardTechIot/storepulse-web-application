/**
 * Controls whether an account can sign in.
 */
export enum UserStatus {
  /** The account is enabled and may sign in. */
  Active = 'ACTIVE',

  /** The account is disabled and may not sign in. */
  Inactive = 'INACTIVE',
}
