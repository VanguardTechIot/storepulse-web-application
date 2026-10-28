import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Email } from '../../domain/model/email.value-object';
import { IamError, IamErrorCode } from '../../domain/model/iam-error';
import { PasswordPolicy } from '../../domain/model/password-policy';
import { PasswordRecovery } from '../../domain/model/password-recovery.entity';
import { RequestPasswordResetCommand } from '../../domain/model/request-password-reset.command';
import { ResetPasswordCommand } from '../../domain/model/reset-password.command';
import { Role } from '../../domain/model/role.enum';
import { SignInCommand } from '../../domain/model/sign-in.command';
import { SignUpCommand } from '../../domain/model/sign-up.command';
import { UserSession } from '../../domain/model/user-session.value-object';
import { UserStatus } from '../../domain/model/user-status.enum';
import { IamRepository } from '../../domain/repository/iam.repository';
import { PasswordRecoveryAssembler, UserAccountAssembler } from '../identity-access-assemblers';
import {
  PasswordRecoveryResource,
  ProfileCreationRequest,
  SignUpRequest,
  UserResource,
} from '../identity-access-responses';
import { PasswordHasher } from '../password-hasher';

const apiUrl = environment.platformProviderApiBaseUrl;
const usersUrl = `${apiUrl}${environment.platformProviderUsersEndpointPath}`;
const passwordRecoveriesUrl = `${apiUrl}${environment.platformProviderPasswordRecoveriesEndpointPath}`;
const profilesUrl = `${apiUrl}${environment.platformProviderProfilesEndpointPath}`;

/**
 * HTTP implementation of the IAM repository using the local data server (json-server).
 *
 * Since json-server only stores data, this class reproduces rules that will be enforced by the
 * REST API, such as credential validation, email uniqueness, and reset-code expiration. When the
 * backend is available, this implementation can be replaced without affecting the rest of the
 * context.
 */
export class HttpIamRepository implements IamRepository {
  private readonly http = inject(HttpClient);
  private readonly passwordHasher = inject(PasswordHasher);
  private readonly userAccountAssembler = new UserAccountAssembler();
  private readonly passwordRecoveryAssembler = new PasswordRecoveryAssembler();

  /**
   * Authenticates a user using the supplied email address and password.
   *
   * @param command - Sign-in credentials.
   * @returns A promise that resolves to the authenticated user session.
   * @throws {IamError} If the credentials are invalid.
   */
  async signIn(command: SignInCommand): Promise<UserSession> {
    const user = await this.findUserByEmail(command.email);
    const passwordHash = await this.passwordHasher.hash(command.password);
    if (!user || user.passwordHash !== passwordHash) {
      throw new IamError(IamErrorCode.InvalidCredentials);
    }
    return this.toSession(user);
  }

  /**
   * Registers a gallery administrator and creates the associated profile.
   *
   * @param command - Registration details.
   * @returns A promise that resolves to the new user's session.
   * @throws {IamError} If the password is weak or the email is already registered.
   */
  async signUp(command: SignUpCommand): Promise<UserSession> {
    if (!PasswordPolicy.isSatisfiedBy(command.password)) {
      throw new IamError(IamErrorCode.WeakPassword);
    }
    const email = new Email(command.email).value;
    if (await this.findUserByEmail(email)) {
      throw new IamError(IamErrorCode.EmailAlreadyRegistered);
    }
    const request: SignUpRequest = {
      email,
      passwordHash: await this.passwordHasher.hash(command.password),
      role: Role.GalleryAdministrator,
      status: UserStatus.Active,
    };
    const user = await firstValueFrom(this.http.post<UserResource>(usersUrl, request));
    await firstValueFrom(
      this.http.post(profilesUrl, this.toProfileCreationRequest(user, command.fullName)),
    );
    return this.toSession(user);
  }

  /**
   * Requests a password reset without revealing whether the email is registered.
   *
   * @param command - Password reset request details.
   * @returns A promise that resolves to the reset code's expiration date.
   */
  async requestPasswordReset(command: RequestPasswordResetCommand): Promise<Date> {
    const user = await this.findUserByEmail(command.email);
    const passwordRecovery = PasswordRecovery.generate(user?.id ?? '');
    if (user) {
      await firstValueFrom(
        this.http.post<PasswordRecoveryResource>(
          passwordRecoveriesUrl,
          this.passwordRecoveryAssembler.toRequestFromEntity(passwordRecovery),
        ),
      );
      if (!environment.production) {
        // Stands in for the email delivery service while working with the local JSON API.
        console.info(`[IAM] Password reset code: ${passwordRecovery.code.value}`);
      }
    }
    return passwordRecovery.expiresAt;
  }

  /**
   * Resets a user's password after validating the recovery code and password policy.
   *
   * @param command - Email address, reset code, and new password.
   * @returns A promise that resolves when the password has been reset.
   * @throws {IamError} If the password is weak or the reset code is invalid or expired.
   */
  async resetPassword(command: ResetPasswordCommand): Promise<void> {
    if (!PasswordPolicy.isSatisfiedBy(command.newPassword)) {
      throw new IamError(IamErrorCode.WeakPassword);
    }
    const user = await this.findUserByEmail(command.email);
    const passwordRecovery = user ? await this.findLatestPasswordRecovery(user.id) : null;
    if (!user || !passwordRecovery?.validate(command.code)) {
      throw new IamError(IamErrorCode.InvalidResetCode);
    }
    if (passwordRecovery.isExpired()) {
      throw new IamError(IamErrorCode.ExpiredResetCode);
    }
    const passwordHash = await this.passwordHasher.hash(command.newPassword);
    await firstValueFrom(this.http.patch(`${usersUrl}/${user.id}`, { passwordHash }));
    await firstValueFrom(
      this.http.patch(`${passwordRecoveriesUrl}/${passwordRecovery.id}`, { used: true }),
    );
  }

  /**
   * Finds a user by normalized email address.
   *
   * @param email - Email address to look up.
   * @returns A promise that resolves to the matching user, or `null` if none exists.
   */
  private async findUserByEmail(email: string): Promise<UserResource | null> {
    const params = { email: Email.normalize(email) };
    const users = await firstValueFrom(this.http.get<UserResource[]>(usersUrl, { params }));
    return users[0] ?? null;
  }

  /**
   * Retrieves the most recently requested password recovery for a user.
   *
   * @param userId - Identifier of the user whose recovery is requested.
   * @returns A promise that resolves to the latest recovery, or `null` if none exists.
   */
  private async findLatestPasswordRecovery(userId: string): Promise<PasswordRecovery | null> {
    const params = { userId, _sort: 'requestedAt', _order: 'desc', _limit: 1 };
    const [latest] = await firstValueFrom(
      this.http.get<PasswordRecoveryResource[]>(passwordRecoveriesUrl, { params }),
    );
    return latest ? this.passwordRecoveryAssembler.toEntityFromResource(latest) : null;
  }

  /**
   * Builds a profile creation request for the local API.
   *
   * The REST API creates the profile in Profiles and Preferences during registration. The first
   * word of the registration name becomes the first name; the user can edit it in My Profile.
   *
   * @param user - Newly created user resource.
   * @param fullName - Full name supplied during registration.
   * @returns The request body for creating the user's profile.
   */
  private toProfileCreationRequest(user: UserResource, fullName: string): ProfileCreationRequest {
    const [firstName = '', ...lastNames] = fullName.trim().split(/\s+/);
    return {
      id: user.id,
      userId: user.id,
      firstName,
      lastName: lastNames.join(' '),
      email: user.email,
      phoneNumber: null,
      photoUrl: null,
    };
  }

  /**
   * Creates an authenticated session for a user resource.
   *
   * @param user - User resource to include in the session.
   * @returns The user's session with an access token.
   */
  private toSession(user: UserResource): UserSession {
    return new UserSession({
      user: this.userAccountAssembler.toEntityFromResource(user),
      // The real REST API issues a JWT (TokenService); the local JSON API uses an opaque token.
      accessToken: crypto.randomUUID(),
    });
  }
}
