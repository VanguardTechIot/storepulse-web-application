export class RequestPasswordResetCommand {
  readonly email: string;

  constructor(command: { email: string }) {
    this.email = command.email;
  }
}
