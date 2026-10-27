import { firstValueFrom, Observable } from 'rxjs';
import { retryOnDroppedConnection } from './retry-on-dropped-connection';

/**
 * Sends an HTTP request as a promise, retrying dropped connections, and replaces any failure with
 * the business error given by the caller.
 */
export async function sendRequest<T>(request: Observable<T>, failure: () => Error): Promise<T> {
  try {
    return await firstValueFrom(request.pipe(retryOnDroppedConnection()));
  } catch {
    throw failure();
  }
}
