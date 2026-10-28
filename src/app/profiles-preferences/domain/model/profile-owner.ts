import { AccountRole } from './account-role.enum';

/**
 * Signed-in account that owns the profile, translated from Identity and Access Management.
 */
export interface ProfileOwner {
  /** Identifier of the account that owns the profile. */
  userId: string;

  /** Role of the account that owns the profile. */
  role: AccountRole;
}
