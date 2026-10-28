import { Injectable } from '@angular/core';
import { Role } from '../domain/model/role.enum';
import { UserAccount } from '../domain/model/user-account.entity';
import { UserSession } from '../domain/model/user-session.value-object';
import { UserStatus } from '../domain/model/user-status.enum';

interface StoredSession {
  /** Token authorizing the user's requests. */
  accessToken: string;
  /** Account data required to restore the user session. */
  user: { id: string; email: string; role: Role; status: UserStatus };
}

const storageKey = 'storepulse.iam.session';

/**
 * Persists and retrieves the authenticated user session.
 *
 * "Keep me signed in" uses `localStorage`; otherwise, the session is stored in
 * `sessionStorage` and ends when the browser tab is closed.
 */
@Injectable({ providedIn: 'root' })
export class IamSessionStorage {
  /**
   * Saves a session to browser storage, clearing any previously stored session first.
   *
   * @param session - Authenticated session to persist.
   * @param keepSignedIn - Whether to persist the session across browser restarts.
   */
  save(session: UserSession, keepSignedIn: boolean): void {
    const stored: StoredSession = {
      accessToken: session.accessToken,
      user: {
        id: session.user.id,
        email: session.user.email,
        role: session.user.role,
        status: session.user.status,
      },
    };
    this.clear();
    try {
      (keepSignedIn ? localStorage : sessionStorage).setItem(storageKey, JSON.stringify(stored));
    } catch {
      // Storage may be unavailable (private mode); the session then lasts only in memory.
    }
  }

  /**
   * Rewrites the session while preserving its existing persistent or tab-only storage choice.
   *
   * @param session - Updated session to persist.
   */
  update(session: UserSession): void {
    let keepSignedIn = false;
    try {
      keepSignedIn = localStorage.getItem(storageKey) !== null;
    } catch {
      // Storage may be unavailable (private mode); save() then keeps the session in memory only.
    }
    this.save(session, keepSignedIn);
  }

  /**
   * Loads the stored session from browser storage.
   *
   * @returns The restored session, or `null` if none is available or it cannot be parsed.
   */
  load(): UserSession | null {
    try {
      const raw = sessionStorage.getItem(storageKey) ?? localStorage.getItem(storageKey);
      if (!raw) return null;
      const stored = JSON.parse(raw) as StoredSession;
      return new UserSession({ user: new UserAccount(stored.user), accessToken: stored.accessToken });
    } catch {
      return null;
    }
  }

  /**
   * Gets the access token from the stored session.
   *
   * @returns The access token, or `null` if no session is available.
   */
  accessToken(): string | null {
    return this.load()?.accessToken ?? null;
  }

  /** Removes the stored session from both browser storage locations. */
  clear(): void {
    try {
      localStorage.removeItem(storageKey);
      sessionStorage.removeItem(storageKey);
    } catch {
      // Nothing to clear when storage is unavailable.
    }
  }
}
