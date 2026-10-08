import { DOCUMENT, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export type Language = 'es-419' | 'en-US';
type Dictionary = { [key: string]: string | Dictionary };

const STORAGE_KEY = 'storepulse.language';

/**
 * Loads the localization files published in public/i18n and resolves dotted keys.
 */
@Injectable({ providedIn: 'root' })
export class TranslationService {
  static readonly languages: readonly Language[] = ['es-419', 'en-US'];

  private readonly http = inject(HttpClient);
  private readonly document = inject(DOCUMENT);
  private readonly dictionaries = signal<Partial<Record<Language, Dictionary>>>({});

  readonly language = signal<Language>(this.readStoredLanguage());

  /** Loads the initial language before the first render. */
  init(): Promise<void> {
    return this.use(this.language());
  }

  async use(language: Language): Promise<void> {
    if (!this.dictionaries()[language]) {
      const dictionary = await firstValueFrom(this.http.get<Dictionary>(`i18n/${language}.json`));
      this.dictionaries.update((current) => ({ ...current, [language]: dictionary }));
    }
    this.language.set(language);
    this.document.documentElement.lang = language;
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch {
      // Storage may be unavailable (private mode); the language still applies to this session.
    }
  }

  translate(key: string, params?: Record<string, string | number>): string {
    const value = key
      .split('.')
      .reduce<string | Dictionary | undefined>(
        (node, part) => (typeof node === 'object' ? node[part] : undefined),
        this.dictionaries()[this.language()],
      );
    if (typeof value !== 'string') return key;
    return params
      ? value.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, name: string) => String(params[name] ?? match))
      : value;
  }

  private readStoredLanguage(): Language {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
      if (stored && TranslationService.languages.includes(stored)) return stored;
    } catch {
      // Ignore storage errors and fall back to the default language.
    }
    return 'es-419';
  }
}
