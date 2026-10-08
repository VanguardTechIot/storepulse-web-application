import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

/**
 * Provides a uniform way to turn HTTP failures into errors with a readable message.
 */
export abstract class ErrorHandlingEnabledBaseType {
  /**
   * Builds an error handler for an HTTP operation.
   * @param operation - Name of the operation that failed.
   */
  protected handleError(operation: string) {
    return (error: HttpErrorResponse): Observable<never> => {
      let errorMessage: string;
      if (error.status === 401) {
        errorMessage = `${operation}: unauthorized`;
      } else if (error.status === 404) {
        errorMessage = `${operation}: resource not found`;
      } else if (error.error instanceof ErrorEvent) {
        errorMessage = `${operation}: ${error.error.message}`;
      } else {
        errorMessage = `${operation}: ${error.statusText || 'unexpected error'}`;
      }
      return throwError(() => new Error(errorMessage));
    };
  }
}
