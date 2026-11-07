import { HttpErrorResponse } from '@angular/common/http';
import { ApiError } from '../domain/model/api-error';
import { toApiError } from './to-api-error';

describe('toApiError', () => {
  it('keeps the error resource answered by the backend', () => {
    const error = toApiError(
      new HttpErrorResponse({
        status: 404,
        statusText: 'Not Found',
        url: 'http://localhost:3000/subscriptions/sub-1',
        error: {
          status: 404,
          error: 'Not Found',
          message: 'subscription_not_found',
          path: '/subscriptions/sub-1',
          timestamp: '2026-10-30T10:00:00Z',
        },
      }),
    );

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(404);
    expect(error.message).toBe('subscription_not_found');
    expect(error.path).toBe('/subscriptions/sub-1');
    expect(error.timestamp).toBe('2026-10-30T10:00:00Z');
  });

  it('fills the fields from the response when the body is not an error resource', () => {
    const error = toApiError(
      new HttpErrorResponse({
        status: 500,
        statusText: 'Internal Server Error',
        url: 'http://localhost:3000/payments',
        error: 'boom',
      }),
    );

    expect(error.status).toBe(500);
    expect(error.error).toBe('Internal Server Error');
    expect(error.path).toBe('/payments');
    expect(error.isNetworkFailure).toBe(false);
  });

  it('marks a request without response as a network failure', () => {
    const error = toApiError(
      new HttpErrorResponse({ status: 0, url: 'http://localhost:3000/plans' }),
    );

    expect(error.isNetworkFailure).toBe(true);
  });
});
