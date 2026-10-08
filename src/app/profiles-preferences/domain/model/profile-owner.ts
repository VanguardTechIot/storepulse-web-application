import { AccountRole } from './account-role.enum';

/**
 * Signed-in account that owns the profile, translated from Identity and Access Management.
 */
export interface ProfileOwner {
  userId: string;
  role: AccountRole;
}
