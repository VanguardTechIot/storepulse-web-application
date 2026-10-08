import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, defer, EMPTY, finalize, map, Observable, tap } from 'rxjs';
import { IamError, IamErrorCode } from '../domain/model/iam-error';
import { RequestPasswordResetCommand } from '../domain/model/request-password-reset.command';
import { ResetPasswordCommand } from '../domain/model/reset-password.command';
import { SignInCommand } from '../domain/model/sign-in.command';
import { SignUpCommand } from '../domain/model/sign-up.command';
import { UserAccount } from '../domain/model/user-account.entity';
import { UserSession } from '../domain/model/user-session.value-object';
import { IamApi } from '../infrastructure/iam-api';
import { IamSessionStorage } from '../infrastructure/iam-session-storage';

/**
 * Coordinates the Identity and Access Management use cases and keeps the session state.
 *
 * Every operation returns an observable that emits only on success: failures are exposed through
 * `error` (an `IamErrorCode`), so views just subscribe to continue the flow.
 */
@Injectable({ providedIn: 'root' })
export class IamStore {
  private readonly iamApi = inject(IamApi);
  private readonly sessionStorage = inject(IamSessionStorage);

  private readonly currentUserSignal = signal<UserAccount | null>(null);
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<IamErrorCode | null>(null);
  private readonly passwordRecoverySignal = signal<{ email: string; expiresAt: Date } | null>(
    null,
  );

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isSignedIn = computed(() => this.currentUserSignal() !== null);
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  /** Email and expiration of the recovery code requested in this visit. */
  readonly passwordRecovery = this.passwordRecoverySignal.asReadonly();

  constructor() {
    const session = this.sessionStorage.load();
    if (session?.user.canAccessWebApplication()) {
      this.currentUserSignal.set(session.user);
    } else {
      this.sessionStorage.clear();
    }
  }

  signIn(command: SignInCommand, keepSignedIn: boolean): Observable<UserAccount> {
    return this.execute(
      this.iamApi.signIn(command).pipe(
        tap((session) => this.ensureWebAccess(session.user)),
        tap((session) => this.startSession(session, keepSignedIn)),
        map((session) => session.user),
      ),
    );
  }

  /** Registers the gallery administrator and leaves the session started for the next steps. */
  signUp(command: SignUpCommand): Observable<UserAccount> {
    return this.execute(
      this.iamApi.signUp(command).pipe(
        tap((session) => this.startSession(session, false)),
        map((session) => session.user),
      ),
    );
  }

  signOut(): void {
    this.sessionStorage.clear();
    this.currentUserSignal.set(null);
  }

  requestPasswordReset(command: RequestPasswordResetCommand): Observable<Date> {
    return this.execute(
      this.iamApi.requestPasswordReset(command).pipe(
        tap((expiresAt) => this.passwordRecoverySignal.set({ email: command.email, expiresAt })),
      ),
    );
  }

  resetPassword(command: ResetPasswordCommand): Observable<void> {
    return this.execute(
      this.iamApi.resetPassword(command).pipe(tap(() => this.passwordRecoverySignal.set(null))),
    );
  }

  clearError(): void {
    this.errorSignal.set(null);
  }

  /** Web access is reserved for active gallery administrators; tenants use the mobile app. */
  private ensureWebAccess(user: UserAccount): void {
    if (!user.isActive()) throw new IamError(IamErrorCode.AccountInactive);
    if (!user.isGalleryAdministrator()) throw new IamError(IamErrorCode.RoleNotAllowed);
  }

  private startSession(session: UserSession, keepSignedIn: boolean): void {
    this.sessionStorage.save(session, keepSignedIn);
    this.currentUserSignal.set(session.user);
  }

  private execute<T>(operation: Observable<T>): Observable<T> {
    return defer(() => {
      this.loadingSignal.set(true);
      this.errorSignal.set(null);
      return operation.pipe(
        catchError((error: unknown) => {
          if (!(error instanceof IamError)) console.error('[IAM]', error);
          this.errorSignal.set(error instanceof IamError ? error.code : IamErrorCode.Unexpected);
          return EMPTY;
        }),
        finalize(() => this.loadingSignal.set(false)),
      );
    });
  }
}
