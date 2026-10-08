import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { UserAccount } from '../domain/model/user-account.entity';
import { SignUpRequest } from './sign-up.request';
import { UserAccountAssembler } from './user-account-assembler';
import { UserAccountResource, UserResource, UsersResponse } from './users-response';

const usersEndpointUrl = `${environment.platformProviderApiBaseUrl}${environment.platformProviderUsersEndpointPath}`;

export class UsersApiEndpoint extends BaseApiEndpoint<
  UserAccount,
  UserAccountResource,
  UsersResponse,
  UserAccountAssembler
> {
  constructor(http: HttpClient) {
    super(http, usersEndpointUrl, new UserAccountAssembler());
  }

  findByEmail(email: string): Observable<UserResource | null> {
    return this.http.get<UserResource[]>(this.endpointUrl, { params: { email } }).pipe(
      map((users) => users[0] ?? null),
      catchError(this.handleError('Failed to find user by email')),
    );
  }

  register(request: SignUpRequest): Observable<UserResource> {
    return this.http
      .post<UserResource>(this.endpointUrl, request)
      .pipe(catchError(this.handleError('Failed to register user')));
  }

  changePasswordHash(userId: number, passwordHash: string): Observable<UserResource> {
    return this.http
      .patch<UserResource>(`${this.endpointUrl}/${userId}`, { passwordHash })
      .pipe(catchError(this.handleError(`Failed to change password of user ${userId}`)));
  }
}
