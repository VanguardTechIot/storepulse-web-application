/**
 * Command containing the information required to request a password reset.
 */
export class RequestPasswordResetCommand {
  /** Email address associated with the account requesting a reset. */
  readonly email: string;

  /**
   * Creates a password reset request command.
   *
   * @param command - Command data containing the account email address.
   */
  constructor(command: { email: string }) {
    this.email = command.email;
  }
}
