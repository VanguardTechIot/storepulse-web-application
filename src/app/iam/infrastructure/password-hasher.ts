import { Injectable } from '@angular/core';

/**
 * Hashes a password before it is stored or compared using SHA-256.
 *
 * In the production REST API, hashing is performed on the server. This implementation prevents
 * plain-text passwords from being stored by the local JSON API.
 */
@Injectable({ providedIn: 'root' })
export class PasswordHasher {
  /**
   * Computes the SHA-256 hash of a password and returns it as a hexadecimal string.
   *
   * @param password - Plain-text password to hash.
   * @returns A promise that resolves to the hexadecimal password hash.
   */
  async hash(password: string): Promise<string> {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
  }
}
