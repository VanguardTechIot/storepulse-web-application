import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { IamSessionStorage } from './iam-session-storage';

/**
 * Attaches the access token to every request sent to the StorePulse API (and only to it).
 */
export const authenticationInterceptor: HttpInterceptorFn = (request, next) => {
  const accessToken = inject(IamSessionStorage).accessToken();
  if (!accessToken || !request.url.startsWith(environment.platformProviderApiBaseUrl)) {
    return next(request);
  }
  return next(request.clone({ setHeaders: { Authorization: `Bearer ${accessToken}` } }));
};
