import { RequestPasswordResetCommand } from '../model/request-password-reset.command';
import { ResetPasswordCommand } from '../model/reset-password.command';
import { SignInCommand } from '../model/sign-in.command';
import { SignUpCommand } from '../model/sign-up.command';
import { UserSession } from '../model/user-session.value-object';

/**
 * Abstracción de acceso del contexto Identity and Access Management.
 * Refleja los casos de uso de `AuthenticationController` y `PasswordRecoveryController` del
 * REST API. Los errores de negocio se lanzan como `IamError`.
 */
export interface IdentityAccessRepository {
  signIn(command: SignInCommand): Promise<UserSession>;
  signUp(command: SignUpCommand): Promise<UserSession>;
  /** Genera el código de 6 dígitos y devuelve cuándo vence. */
  requestPasswordReset(command: RequestPasswordResetCommand): Promise<Date>;
  resetPassword(command: ResetPasswordCommand): Promise<void>;
}
