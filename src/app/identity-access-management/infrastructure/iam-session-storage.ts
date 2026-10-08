import { Injectable } from '@angular/core';
import { Role } from '../domain/model/role.enum';
import { UserAccount } from '../domain/model/user-account.entity';
import { UserSession } from '../domain/model/user-session.value-object';
import { UserStatus } from '../domain/model/user-status.enum';

interface StoredSession {
  accessToken: string;
  user: { id: number; email: string; role: Role; status: UserStatus };
}

const storageKey = 'storepulse.iam.session';

/**
 * Keeps the session between page reloads. "Keep me signed in" uses localStorage; otherwise the
 * session lives in sessionStorage and ends when the browser tab is closed.
 */
@Injectable({ providedIn: 'root' })
export class IamSessionStorage {
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

  accessToken(): string | null {
    return this.load()?.accessToken ?? null;
  }

  clear(): void {
    try {
      localStorage.removeItem(storageKey);
      sessionStorage.removeItem(storageKey);
    } catch {
      // Nothing to clear when storage is unavailable.
    }
  }
}
