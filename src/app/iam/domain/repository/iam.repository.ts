import { RequestPasswordResetCommand } from '../model/request-password-reset.command';
import { ResetPasswordCommand } from '../model/reset-password.command';
import { SignInCommand } from '../model/sign-in.command';
import { SignUpCommand } from '../model/sign-up.command';
import { UserSession } from '../model/user-session.value-object';

/**
 * Repository abstraction for the Identity and Access Management context.
 *
 * Mirrors the use cases exposed by the REST API's `AuthenticationController` and
 * `PasswordRecoveryController`. Business errors are thrown as `IamError` instances.
 */
export interface IamRepository {
  /**
   * Authenticates a user with the supplied credentials.
   *
   * @param command - Sign-in credentials.
   * @returns A promise that resolves to the authenticated user session.
   */
  signIn(command: SignInCommand): Promise<UserSession>;

  /**
   * Registers a new user account.
   *
   * @param command - Registration details.
   * @returns A promise that resolves to the new user's session.
   */
  signUp(command: SignUpCommand): Promise<UserSession>;

  /**
   * Requests a password reset by generating a six-digit code.
   *
   * @param command - Password reset request details.
   * @returns A promise that resolves to the code's expiration date.
   */
  requestPasswordReset(command: RequestPasswordResetCommand): Promise<Date>;

  /**
   * Resets a user's password using the supplied reset code.
   *
   * @param command - Email address, reset code, and new password.
   * @returns A promise that resolves when the password has been reset.
   */
  resetPassword(command: ResetPasswordCommand): Promise<void>;
}
