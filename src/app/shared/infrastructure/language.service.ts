import { computed, DOCUMENT, inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

export const supportedLanguages = ['en-US', 'es-419'] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

/** English is the default language of every StorePulse product. */
export const defaultLanguage: SupportedLanguage = 'en-US';

const storageKey = 'storepulse.language';

/**
 * Applies and remembers the interface language (en-US / es-419).
 */
@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly translate = inject(TranslateService);
  private readonly document = inject(DOCUMENT);

  readonly currentLanguage = computed(
    () => (this.translate.currentLang() ?? defaultLanguage) as SupportedLanguage,
  );

  /** Loads the remembered language (or the default one) before the first render. */
  initialize(): Observable<unknown> {
    this.translate.addLangs([...supportedLanguages]);
    return this.use(this.readStoredLanguage() ?? defaultLanguage);
  }

  use(language: SupportedLanguage): Observable<unknown> {
    this.document.documentElement.lang = language;
    try {
      localStorage.setItem(storageKey, language);
    } catch {
      // Storage may be unavailable (private mode); the language still applies for this visit.
    }
    return this.translate.use(language);
  }

  private readStoredLanguage(): SupportedLanguage | null {
    try {
      const stored = localStorage.getItem(storageKey);
      return supportedLanguages.find((language) => language === stored) ?? null;
    } catch {
      return null;
    }
  }
}
