import { firstValueFrom, Observable } from 'rxjs';
import { ApiError } from '../domain/model/api-error';
import { retryOnDroppedConnection } from './retry-on-dropped-connection';
import { toApiError } from './to-api-error';

/**
 * Sends an HTTP request as a promise, retrying dropped connections. A failure arrives as an
 * `ApiError`, which the caller translates into its business error.
 */
export async function sendRequest<T>(
  request: Observable<T>,
  failure: (error: ApiError) => Error,
): Promise<T> {
  try {
    return await firstValueFrom(request.pipe(retryOnDroppedConnection()));
  } catch (error) {
    throw failure(toApiError(error));
  }
}
