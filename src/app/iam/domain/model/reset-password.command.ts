export class ResetPasswordCommand {
  readonly email: string;
  readonly code: string;
  readonly newPassword: string;

  constructor(command: { email: string; code: string; newPassword: string }) {
    this.email = command.email;
    this.code = command.code;
    this.newPassword = command.newPassword;
  }
}
