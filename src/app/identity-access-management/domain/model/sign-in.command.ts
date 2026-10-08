export class SignInCommand {
  readonly email: string;
  readonly password: string;

  constructor(command: { email: string; password: string }) {
    this.email = command.email;
    this.password = command.password;
  }
}
