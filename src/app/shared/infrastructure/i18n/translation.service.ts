import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export type Lang = 'es-419' | 'en-US';

type Dictionary = Record<string, string>;

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private readonly http = inject(HttpClient);
  private readonly dictionaries = signal<Partial<Record<Lang, Dictionary>>>({});

  readonly lang = signal<Lang>('es-419');

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
  t(key: string): string {
    return this.dictionaries()[this.lang()]?.[key] ?? key;
  }
}
