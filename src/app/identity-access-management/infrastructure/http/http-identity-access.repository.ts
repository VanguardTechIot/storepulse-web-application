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
import { IdentityAccessRepository } from '../../domain/repository/identity-access.repository';
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
 * Implementación HTTP del repositorio sobre el servidor de datos local (json-server).
 *
 * json-server solo guarda datos, así que esta clase reproduce las reglas que aplicará el REST API
 * (validar credenciales, unicidad del correo, vigencia del código). Cuando exista el backend,
 * solo cambia esta clase: el resto del contexto no se entera.
 */
export class HttpIdentityAccessRepository implements IdentityAccessRepository {
  private readonly http = inject(HttpClient);
  private readonly passwordHasher = inject(PasswordHasher);
  private readonly userAccountAssembler = new UserAccountAssembler();
  private readonly passwordRecoveryAssembler = new PasswordRecoveryAssembler();

  async signIn(command: SignInCommand): Promise<UserSession> {
    const user = await this.findUserByEmail(command.email);
    const passwordHash = await this.passwordHasher.hash(command.password);
    if (!user || user.passwordHash !== passwordHash) {
      throw new IamError(IamErrorCode.InvalidCredentials);
    }
    return this.toSession(user);
  }

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

  /** Answers the same whether the email exists or not, so the form does not reveal accounts. */
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

  private async findUserByEmail(email: string): Promise<UserResource | null> {
    const params = { email: Email.normalize(email) };
    const users = await firstValueFrom(this.http.get<UserResource[]>(usersUrl, { params }));
    return users[0] ?? null;
  }

  private async findLatestPasswordRecovery(userId: string): Promise<PasswordRecovery | null> {
    const params = { userId, _sort: 'requestedAt', _order: 'desc', _limit: 1 };
    const [latest] = await firstValueFrom(
      this.http.get<PasswordRecoveryResource[]>(passwordRecoveriesUrl, { params }),
    );
    return latest ? this.passwordRecoveryAssembler.toEntityFromResource(latest) : null;
  }

  /**
   * The REST API creates the profile in Profiles and Preferences when a user signs up. The first
   * word of the registration name becomes the first name; the user can correct it in My profile.
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

  private toSession(user: UserResource): UserSession {
    return new UserSession({
      user: this.userAccountAssembler.toEntityFromResource(user),
      // The real REST API issues a JWT (TokenService); the local JSON API uses an opaque token.
      accessToken: crypto.randomUUID(),
    });
  }
}
