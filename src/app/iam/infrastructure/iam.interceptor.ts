import { HttpErrorResponse, HttpInterceptorFn, HttpStatusCode } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { IamStore } from '../application/iam.store';
import { iamNav } from '../presentation/iam.nav';
import { IamSessionStorage } from './iam-session-storage';

/**
 * Attaches the access token to requests sent to the StorePulse API, and only to that API.
 * When the API rejects the token (expired or revoked), it closes the session and sends the
 * user back to sign-in, keeping the page to return to.
 *
 * @param request - Outgoing HTTP request.
 * @param next - Handler that forwards the request.
 * @returns The observable for the forwarded HTTP request.
 */
export const authenticationInterceptor: HttpInterceptorFn = (request, next) => {
  const accessToken = inject(IamSessionStorage).accessToken();
  if (!accessToken || !request.url.startsWith(environment.platformProviderApiBaseUrl)) {
    return next(request);
  }
  const store = inject(IamStore);
  const router = inject(Router);
  return next(request.clone({ setHeaders: { Authorization: `Bearer ${accessToken}` } })).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === HttpStatusCode.Unauthorized) {
        const returnUrl = router.url;
        store.signOut();
        void router.navigate(iamNav.signIn(), { queryParams: { returnUrl } });
      }
      return throwError(() => error);
    }),
  );
};
