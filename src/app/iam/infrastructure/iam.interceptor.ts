import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { IamSessionStorage } from './iam-session-storage';

/**
 * Attaches the access token to requests sent to the StorePulse API, and only to that API.
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
  return next(request.clone({ setHeaders: { Authorization: `Bearer ${accessToken}` } }));
};
