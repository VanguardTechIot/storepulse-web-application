import { UserAccount } from './user-account.entity';

/**
 * Result of a successful authentication: the account and the access token that authorizes
 * its requests.
 */
export class UserSession {
  readonly user: UserAccount;
  readonly accessToken: string;

  constructor(session: { user: UserAccount; accessToken: string }) {
    this.user = session.user;
    this.accessToken = session.accessToken;
  }
}
