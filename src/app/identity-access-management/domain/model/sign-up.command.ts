/**
 * Registers a gallery administrator (US-01). The full name travels with the registration so the
 * profile can be created in Profiles and Preferences; this context does not keep it.
 */
export class SignUpCommand {
  readonly fullName: string;
  readonly email: string;
  readonly password: string;

  constructor(command: { fullName: string; email: string; password: string }) {
    this.fullName = command.fullName;
    this.email = command.email;
    this.password = command.password;
  }
}
