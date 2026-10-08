import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, of, switchMap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BaseApi } from '../../shared/infrastructure/base-api';
import { Email } from '../domain/model/email.value-object';
import { IamError, IamErrorCode } from '../domain/model/iam-error';
import { PasswordPolicy } from '../domain/model/password-policy';
import { PasswordRecovery } from '../domain/model/password-recovery.entity';
import { RequestPasswordResetCommand } from '../domain/model/request-password-reset.command';
import { ResetPasswordCommand } from '../domain/model/reset-password.command';
import { Role } from '../domain/model/role.enum';
import { SignInCommand } from '../domain/model/sign-in.command';
import { SignUpCommand } from '../domain/model/sign-up.command';
import { UserSession } from '../domain/model/user-session.value-object';
import { UserStatus } from '../domain/model/user-status.enum';
import { PasswordHasher } from './password-hasher';
import { PasswordRecoveriesApiEndpoint } from './password-recoveries-api-endpoint';
import { UserAccountAssembler } from './user-account-assembler';
import { UserResource } from './users-response';
import { UsersApiEndpoint } from './users-api-endpoint';

/**
 * Identity and Access Management facade.
 *
 * The local JSON API (json-server) only stores data, so this facade reproduces the use cases of
 * the REST API `AuthenticationController` and `PasswordRecoveryController` on top of plain
 * resources. When the real API is available, only this class needs to change.
 */
@Injectable({ providedIn: 'root' })
export class IamApi extends BaseApi {
  private readonly passwordHasher = inject(PasswordHasher);
  private readonly usersEndpoint: UsersApiEndpoint;
  private readonly passwordRecoveriesEndpoint: PasswordRecoveriesApiEndpoint;
  private readonly userAccountAssembler = new UserAccountAssembler();

  constructor() {
    super();
    const http = inject(HttpClient);
    this.usersEndpoint = new UsersApiEndpoint(http);
    this.passwordRecoveriesEndpoint = new PasswordRecoveriesApiEndpoint(http);
  }

  signIn(command: SignInCommand): Observable<UserSession> {
    return this.usersEndpoint.findByEmail(Email.normalize(command.email)).pipe(
      switchMap((user) => {
        if (!user) return throwError(() => new IamError(IamErrorCode.InvalidCredentials));
        return this.passwordHasher.hash(command.password).pipe(
          map((passwordHash) => {
            if (passwordHash !== user.passwordHash) {
              throw new IamError(IamErrorCode.InvalidCredentials);
            }
            return this.toSession(user);
          }),
        );
      }),
    );
  }

  signUp(command: SignUpCommand): Observable<UserSession> {
    if (!PasswordPolicy.isSatisfiedBy(command.password)) {
      return throwError(() => new IamError(IamErrorCode.WeakPassword));
    }
    const email = new Email(command.email).value;
    return this.usersEndpoint.findByEmail(email).pipe(
      switchMap((existing) => {
        if (existing) return throwError(() => new IamError(IamErrorCode.EmailAlreadyRegistered));
        return this.passwordHasher.hash(command.password);
      }),
      switchMap((passwordHash) =>
        this.usersEndpoint.register({
          fullName: command.fullName.trim(),
          email,
          passwordHash,
          role: Role.GalleryAdministrator,
          status: UserStatus.Active,
        }),
      ),
      map((user) => this.toSession(user)),
    );
  }

  /**
   * Generates a recovery code and returns when it expires. The answer is the same whether the
   * email is registered or not, so the form does not reveal which emails have an account.
   */
  requestPasswordReset(command: RequestPasswordResetCommand): Observable<Date> {
    return this.usersEndpoint.findByEmail(Email.normalize(command.email)).pipe(
      switchMap((user) => {
        const passwordRecovery = PasswordRecovery.generate(user?.id ?? 0);
        if (!user) return of(passwordRecovery);
        return this.passwordRecoveriesEndpoint.register(passwordRecovery);
      }),
      map((passwordRecovery) => {
        if (passwordRecovery.id && !environment.production) {
          // Stands in for the email delivery service while working with the local JSON API.
          console.info(`[IAM] Password reset code: ${passwordRecovery.code.value}`);
        }
        return passwordRecovery.expiresAt;
      }),
    );
  }

  resetPassword(command: ResetPasswordCommand): Observable<void> {
    if (!PasswordPolicy.isSatisfiedBy(command.newPassword)) {
      return throwError(() => new IamError(IamErrorCode.WeakPassword));
    }
    return this.usersEndpoint.findByEmail(Email.normalize(command.email)).pipe(
      switchMap((user) => {
        if (!user) return throwError(() => new IamError(IamErrorCode.InvalidResetCode));
        return this.passwordRecoveriesEndpoint.findLatestByUserId(user.id).pipe(
          switchMap((passwordRecovery) => {
            if (!passwordRecovery?.validate(command.code)) {
              return throwError(() => new IamError(IamErrorCode.InvalidResetCode));
            }
            if (passwordRecovery.isExpired()) {
              return throwError(() => new IamError(IamErrorCode.ExpiredResetCode));
            }
            return this.passwordHasher.hash(command.newPassword).pipe(
              switchMap((passwordHash) => this.usersEndpoint.changePasswordHash(user.id, passwordHash)),
              switchMap(() => this.passwordRecoveriesEndpoint.markAsUsed(passwordRecovery.id)),
            );
          }),
        );
      }),
    );
  }

  private toSession(user: UserResource): UserSession {
    return new UserSession({
      user: this.userAccountAssembler.toEntityFromResource(user),
      // The real REST API issues a JWT (TokenService); the local JSON API uses an opaque token.
      accessToken: crypto.randomUUID(),
    });
  }
}
