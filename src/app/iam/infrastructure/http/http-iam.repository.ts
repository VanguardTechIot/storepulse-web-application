import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { ApiError } from '../../../shared/domain/model/api-error';
import { sendRequest } from '../../../shared/infrastructure/send-request';
import { Email } from '../../domain/model/email.value-object';
import { IamError, IamErrorCode } from '../../domain/model/iam-error';
import { RequestPasswordResetCommand } from '../../domain/model/request-password-reset.command';
import { ResetPasswordCommand } from '../../domain/model/reset-password.command';
import { Role } from '../../domain/model/role.enum';
import { SignInCommand } from '../../domain/model/sign-in.command';
import { SignUpCommand } from '../../domain/model/sign-up.command';
import { UserSession } from '../../domain/model/user-session.value-object';
import { IamRepository } from '../../domain/repository/iam.repository';
import { UserAccountAssembler } from '../identity-access-assemblers';
import {
  AuthenticatedUserResource,
  PasswordResetRequestedResource,
  RequestPasswordResetResource,
  ResetPasswordResource,
  SignInResource,
  SignUpResource,
} from '../identity-access-responses';

const apiUrl = environment.platformProviderApiBaseUrl;
const authenticationUrl = `${apiUrl}${environment.platformProviderAuthenticationEndpointPath}`;
const passwordRecoveriesUrl = `${apiUrl}${environment.platformProviderPasswordRecoveriesEndpointPath}`;

const codes = new Set<string>(Object.values(IamErrorCode));

/** The REST API answers the business code in `message`. */
const failed = (error: ApiError) =>
  new IamError(
    codes.has(error.message) ? (error.message as IamErrorCode) : IamErrorCode.Unexpected,
  );

/**
 * HTTP implementation of the IAM repository over the StorePulse REST API, which validates the
 * credentials, hashes the passwords, issues the JWT and emails the reset codes.
 */
export class HttpIamRepository implements IamRepository {
  private readonly http = inject(HttpClient);
  private readonly assembler = new UserAccountAssembler();

  async signIn(command: SignInCommand): Promise<UserSession> {
    const body: SignInResource = {
      email: Email.normalize(command.email),
      password: command.password,
    };
    const resource = await sendRequest(
      this.http.post<AuthenticatedUserResource>(`${authenticationUrl}/sign-in`, body),
      failed,
    );
    return this.assembler.toSessionFromResource(resource);
  }

  async signUp(command: SignUpCommand): Promise<UserSession> {
    const body: SignUpResource = {
      fullName: command.fullName.trim(),
      email: Email.normalize(command.email),
      password: command.password,
      role: Role.GalleryAdministrator,
    };
    const resource = await sendRequest(
      this.http.post<AuthenticatedUserResource>(`${authenticationUrl}/sign-up`, body),
      failed,
    );
    return this.assembler.toSessionFromResource(resource);
  }

  async requestPasswordReset(command: RequestPasswordResetCommand): Promise<Date> {
    const body: RequestPasswordResetResource = { email: Email.normalize(command.email) };
    const resource = await sendRequest(
      this.http.post<PasswordResetRequestedResource>(passwordRecoveriesUrl, body),
      failed,
    );
    return new Date(resource.expiresAt);
  }

  async resetPassword(command: ResetPasswordCommand): Promise<void> {
    const body: ResetPasswordResource = {
      email: Email.normalize(command.email),
      code: command.code.trim(),
      newPassword: command.newPassword,
    };
    await sendRequest(this.http.post(`${passwordRecoveriesUrl}/reset`, body), failed);
  }
}
