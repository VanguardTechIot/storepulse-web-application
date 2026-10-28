import { UserAccount } from './user-account.entity';

/**
 * Result of a successful authentication: the account and the access token that authorizes
 * its requests.
 */
export class UserSession {
  /** Authenticated user account. */
  readonly user: UserAccount;

  /** Token authorizing the user's requests. */
  readonly accessToken: string;

  /**
   * Creates a session for an authenticated user.
   *
   * @param session - Authenticated account and its access token.
   */
  constructor(session: { user: UserAccount; accessToken: string }) {
    this.user = session.user;
    this.accessToken = session.accessToken;
  }
}
