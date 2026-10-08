import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

/**
 * Base class for the API facades of each bounded context.
 */
export abstract class BaseApi {
  protected readonly http = inject(HttpClient);

  protected endpointUrl(path: string): string {
    return `${environment.platformProviderApiBaseUrl}${path}`;
  }
}
