/**
 * Command containing the information required to reset an account password.
 */
export class ResetPasswordCommand {
  /** Email address associated with the account. */
  readonly email: string;

  /** Password reset code issued for the account. */
  readonly code: string;

  /** New password to set for the account. */
  readonly newPassword: string;

  /**
   * Creates a password reset command.
   *
   * @param command - Email address, reset code, and new password.
   */
  constructor(command: { email: string; code: string; newPassword: string }) {
    this.email = command.email;
    this.code = command.code;
    this.newPassword = command.newPassword;
  }
}
