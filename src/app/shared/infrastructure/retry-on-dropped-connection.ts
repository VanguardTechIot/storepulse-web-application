import { HttpErrorResponse } from '@angular/common/http';
import { MonoTypeOperatorFunction, retry, throwError, timer } from 'rxjs';

/**
 * Retries a request whose connection was dropped before any response arrived (status 0).
 *
 * The local data server runs with `--watch`, so it restarts after every write it makes; a request
 * sent during that restart loses its connection. Use cases that save several resources in a row
 * (a notification and its log, for example) retry instead of failing halfway.
 */
export function retryOnDroppedConnection<T>(attempts = 3): MonoTypeOperatorFunction<T> {
  return retry({
    count: attempts,
    delay: (error: unknown, retryCount: number) =>
      error instanceof HttpErrorResponse && error.status === 0
        ? timer(250 * retryCount)
        : throwError(() => error),
  });
}
