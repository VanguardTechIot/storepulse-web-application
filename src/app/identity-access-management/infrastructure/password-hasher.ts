import { Injectable } from '@angular/core';
import { from, map, Observable } from 'rxjs';

/**
 * Protects a password before it is stored or compared (SHA-256).
 * With the real REST API, hashing happens on the server; here it keeps plain passwords out of
 * the local JSON API.
 */
@Injectable({ providedIn: 'root' })
export class PasswordHasher {
  hash(password: string): Observable<string> {
    return from(crypto.subtle.digest('SHA-256', new TextEncoder().encode(password))).pipe(
      map((digest) =>
        Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join(''),
      ),
    );
  }
}
