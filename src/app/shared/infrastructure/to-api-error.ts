import { HttpErrorResponse } from '@angular/common/http';
import { ApiError } from '../domain/model/api-error';

/** Body of an error answered by the backend. */
export interface ErrorResource {
  status: number;
  error: string;
  message: string;
  path: string;
  timestamp: string;
}

/** Converts any failure of an HTTP call into an `ApiError`. */
export function toApiError(failure: unknown): ApiError {
  if (failure instanceof ApiError) return failure;
  const now = new Date().toISOString();
  if (!(failure instanceof HttpErrorResponse)) {
    return new ApiError(0, 'Unknown Error', String(failure), '', now);
  }
  const body: Partial<ErrorResource> =
    failure.error && typeof failure.error === 'object' ? failure.error : {};
  const path = body.path ?? (failure.url ? new URL(failure.url, location.origin).pathname : '');
  return new ApiError(
    failure.status,
    body.error ?? failure.statusText,
    body.message ?? failure.message,
    path,
    body.timestamp ?? now,
  );
}
