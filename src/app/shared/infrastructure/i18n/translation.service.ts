import { HttpClient } from '@angular/common/http';
import { DOCUMENT, effect, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export type Lang = 'es-419' | 'en-US';

/** Interpolation values for keys such as `"Minimum {{count}} characters"`. */
export type TranslationParams = Record<string, string | number>;

type Dictionary = Record<string, string>;

const supportedLangs: readonly Lang[] = ['en-US', 'es-419'];
/** English is the default language of every StorePulse product (final project statement). */
const defaultLang: Lang = 'en-US';
const storageKey = 'storepulse.language';

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private readonly http = inject(HttpClient);
  private readonly document = inject(DOCUMENT);
  private readonly dictionaries = signal<Partial<Record<Lang, Dictionary>>>({});

  readonly lang = signal<Lang>(readStoredLang() ?? defaultLang);

  constructor() {
    // Keeps <html lang> (screen readers) and the remembered choice in sync with the active language.
    effect(() => {
      const lang = this.lang();
      this.document.documentElement.lang = lang;
      try {
        localStorage.setItem(storageKey, lang);
      } catch {
        // Storage may be unavailable (private mode); the language still applies for this visit.
      }
    });
  }

  async load(lang: Lang = this.lang()): Promise<void> {
    if (this.dictionaries()[lang]) {
      return;
    }
    const dict = await firstValueFrom(this.http.get<Dictionary>(`i18n/${lang}.json`));
    this.dictionaries.update((current) => ({ ...current, [lang]: dict }));
  }

  async setLang(lang: Lang): Promise<void> {
    await this.load(lang);
    this.lang.set(lang);
  }

  /** Lee la clave en el idioma activo. Si falta, devuelve la clave para detectarla rápido. */
  t(key: string, params?: TranslationParams): string {
    const text = this.dictionaries()[this.lang()]?.[key] ?? key;
    if (!params) return text;
    return text.replace(/{{\s*(\w+)\s*}}/g, (match, name: string) =>
      name in params ? String(params[name]) : match,
    );
  }
}

function readStoredLang(): Lang | null {
  try {
    const stored = localStorage.getItem(storageKey);
    return supportedLangs.find((lang) => lang === stored) ?? null;
  } catch {
    return null;
  }
}
