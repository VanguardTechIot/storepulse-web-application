import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { PasswordRecovery } from '../domain/model/password-recovery.entity';
import {
  PasswordRecoveriesResponse,
  PasswordRecoveryResource,
} from './password-recoveries-response';
import { PasswordRecoveryAssembler } from './password-recovery-assembler';

const passwordRecoveriesEndpointUrl = `${environment.platformProviderApiBaseUrl}${environment.platformProviderPasswordRecoveriesEndpointPath}`;

export class PasswordRecoveriesApiEndpoint extends BaseApiEndpoint<
  PasswordRecovery,
  PasswordRecoveryResource,
  PasswordRecoveriesResponse,
  PasswordRecoveryAssembler
> {
  constructor(http: HttpClient) {
    super(http, passwordRecoveriesEndpointUrl, new PasswordRecoveryAssembler());
  }

  register(passwordRecovery: PasswordRecovery): Observable<PasswordRecovery> {
    return this.http
      .post<PasswordRecoveryResource>(
        this.endpointUrl,
        this.assembler.toRequestFromEntity(passwordRecovery),
      )
      .pipe(
        map((resource) => this.assembler.toEntityFromResource(resource)),
        catchError(this.handleError('Failed to register password recovery')),
      );
  }

  findLatestByUserId(userId: number): Observable<PasswordRecovery | null> {
    const params = { userId, _sort: 'requestedAt', _order: 'desc', _limit: 1 };
    return this.http.get<PasswordRecoveryResource[]>(this.endpointUrl, { params }).pipe(
      map(([latest]) => (latest ? this.assembler.toEntityFromResource(latest) : null)),
      catchError(this.handleError(`Failed to find password recovery of user ${userId}`)),
    );
  }

  markAsUsed(passwordRecoveryId: number): Observable<void> {
    return this.http
      .patch<PasswordRecoveryResource>(`${this.endpointUrl}/${passwordRecoveryId}`, { used: true })
      .pipe(
        map(() => undefined),
        catchError(this.handleError(`Failed to use password recovery ${passwordRecoveryId}`)),
      );
  }
}
