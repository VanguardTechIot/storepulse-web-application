/**
 * Registers a gallery administrator (US-01). The full name travels with the registration so the
 * profile can be created in Profiles and Preferences; this context does not keep it.
 */
export class SignUpCommand {
  /** Full name provided for creating the user's profile. */
  readonly fullName: string;

  /** Email address for the new account. */
  readonly email: string;

  /** Password for the new account. */
  readonly password: string;

  /**
   * Creates a sign-up command.
   *
   * @param command - Full name, email address, and password for registration.
   */
  constructor(command: { fullName: string; email: string; password: string }) {
    this.fullName = command.fullName;
    this.email = command.email;
    this.password = command.password;
  }
}
