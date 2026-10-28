/**
 * Command containing the credentials required to sign in.
 */
export class SignInCommand {
  /** Email address associated with the account. */
  readonly email: string;

  /** Password associated with the account. */
  readonly password: string;

  /**
   * Creates a sign-in command.
   *
   * @param command - Email address and password to use for authentication.
   */
  constructor(command: { email: string; password: string }) {
    this.email = command.email;
    this.password = command.password;
  }
}
