import { computed, inject, Injectable, signal } from '@angular/core';
import { IamError, IamErrorCode } from '../domain/model/iam-error';
import { RequestPasswordResetCommand } from '../domain/model/request-password-reset.command';
import { ResetPasswordCommand } from '../domain/model/reset-password.command';
import { SignInCommand } from '../domain/model/sign-in.command';
import { SignUpCommand } from '../domain/model/sign-up.command';
import { UserAccount } from '../domain/model/user-account.entity';
import { UserSession } from '../domain/model/user-session.value-object';
import { IamSessionStorage } from '../infrastructure/iam-session-storage';
import { IDENTITY_ACCESS_REPOSITORY } from '../infrastructure/identity-access.token';

/**
 * Application service of Identity and Access Management: coordinates the use cases and keeps
 * the session state.
 *
 * Each operation resolves to `true` when it succeeds. On failure it resolves to `false` and
 * exposes the reason in `error` (an `IamErrorCode`, translated as `iam.errors.<code>`).
 */
@Injectable({ providedIn: 'root' })
export class IamStore {
  private readonly repository = inject(IDENTITY_ACCESS_REPOSITORY);
  private readonly sessionStorage = inject(IamSessionStorage);

  private readonly currentUserState = signal<UserAccount | null>(null);
  private readonly passwordRecoveryState = signal<{ email: string; expiresAt: Date } | null>(null);

  readonly currentUser = this.currentUserState.asReadonly();
  readonly isSignedIn = computed(() => this.currentUserState() !== null);
  readonly loading = signal(false);
  readonly error = signal<IamErrorCode | null>(null);
  /** Email and expiration of the recovery code requested in this visit. */
  readonly passwordRecovery = this.passwordRecoveryState.asReadonly();

  constructor() {
    const session = this.sessionStorage.load();
    if (session?.user.canAccessWebApplication()) {
      this.currentUserState.set(session.user);
    } else {
      this.sessionStorage.clear();
    }
  }

  signIn(command: SignInCommand, keepSignedIn: boolean): Promise<boolean> {
    return this.execute(async () => {
      const session = await this.repository.signIn(command);
      this.ensureWebAccess(session.user);
      this.startSession(session, keepSignedIn);
    });
  }

  /** Registers the gallery administrator and leaves the session started for the next steps. */
  signUp(command: SignUpCommand): Promise<boolean> {
    return this.execute(async () => {
      this.startSession(await this.repository.signUp(command), false);
    });
  }

  signOut(): void {
    this.sessionStorage.clear();
    this.currentUserState.set(null);
  }

  requestPasswordReset(command: RequestPasswordResetCommand): Promise<boolean> {
    return this.execute(async () => {
      const expiresAt = await this.repository.requestPasswordReset(command);
      this.passwordRecoveryState.set({ email: command.email, expiresAt });
    });
  }

  resetPassword(command: ResetPasswordCommand): Promise<boolean> {
    return this.execute(async () => {
      await this.repository.resetPassword(command);
      this.passwordRecoveryState.set(null);
    });
  }

  clearError(): void {
    this.error.set(null);
  }

  /** Web access is reserved for active gallery administrators; tenants use the mobile app. */
  private ensureWebAccess(user: UserAccount): void {
    if (!user.isActive()) throw new IamError(IamErrorCode.AccountInactive);
    if (!user.isGalleryAdministrator()) throw new IamError(IamErrorCode.RoleNotAllowed);
  }

  private startSession(session: UserSession, keepSignedIn: boolean): void {
    this.sessionStorage.save(session, keepSignedIn);
    this.currentUserState.set(session.user);
  }

  private async execute(operation: () => Promise<void>): Promise<boolean> {
    this.loading.set(true);
    this.error.set(null);
    try {
      await operation();
      return true;
    } catch (error) {
      if (!(error instanceof IamError)) console.error('[IAM]', error);
      this.error.set(error instanceof IamError ? error.code : IamErrorCode.Unexpected);
      return false;
    } finally {
      this.loading.set(false);
    }
  }
}
