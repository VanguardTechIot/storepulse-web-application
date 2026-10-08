import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { BaseEntity } from '../domain/model/base-entity';
import { BaseAssembler } from './base-assembler';
import { BaseResource } from './base-response';

/**
 * Generic REST endpoint. Each bounded context instantiates it with its own path and assembler,
 * so replacing the data source only requires changing the environment base URL.
 */
export class BaseApiEndpoint<TEntity extends BaseEntity, TResource extends BaseResource> {
  constructor(
    protected readonly http: HttpClient,
    protected readonly endpointUrl: string,
    protected readonly assembler: BaseAssembler<TEntity, TResource>,
  ) {}

  getAll(params?: Record<string, string>): Observable<TEntity[]> {
    return this.http
      .get<TResource[]>(this.endpointUrl, { params: new HttpParams({ fromObject: params ?? {} }) })
      .pipe(
        map((resources) => resources.map((resource) => this.assembler.toEntityFromResource(resource))),
        catchError(this.handleError('Failed to fetch resources')),
      );
  }

  getById(id: string): Observable<TEntity> {
    return this.http.get<TResource>(`${this.endpointUrl}/${id}`).pipe(
      map((resource) => this.assembler.toEntityFromResource(resource)),
      catchError(this.handleError('Failed to fetch resource')),
    );
  }

  /**
   * Sends only the changed fields of the entity.
   */
  patch(id: string, changes: Partial<TResource>): Observable<TEntity> {
    return this.http.patch<TResource>(`${this.endpointUrl}/${id}`, changes).pipe(
      map((resource) => this.assembler.toEntityFromResource(resource)),
      catchError(this.handleError('Failed to update resource')),
    );
  }

  protected handleError(operation: string) {
    return (error: HttpErrorResponse) => {
      const detail = error.status === 0 ? 'Server unreachable' : `${error.status} ${error.statusText}`;
      return throwError(() => new ApiError(`${operation}: ${detail}`, error.status));
    };
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}
