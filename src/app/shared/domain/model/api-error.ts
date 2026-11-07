/**
 * Failure of a call to the platform API, with the same shape as the `ErrorResource` returned by
 * the backend. Status 0 means that no response arrived (server down or connection lost).
 */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly error: string,
    message: string,
    readonly path: string,
    readonly timestamp: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  get isNetworkFailure(): boolean {
    return this.status === 0;
  }
}
