import { effect, inject, Injectable, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { TranslationService } from '../infrastructure/i18n/translation.service';

const brandName = 'StorePulse';

/**
 * Translates the browser tab title, so it follows the selected language.
 * The key comes from the route `title` or, when absent, from `data.titleKey`.
 */
@Injectable({ providedIn: 'root' })
export class TranslatedTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly i18n = inject(TranslationService);
  private readonly titleKey = signal<string | null>(null);

  constructor() {
    super();
    effect(() => {
      const key = this.titleKey();
      this.title.setTitle(key ? `${brandName} · ${this.i18n.t(key)}` : brandName);
    });
  }

  override updateTitle(snapshot: RouterStateSnapshot): void {
    this.titleKey.set(this.buildTitle(snapshot) ?? this.deepestTitleKey(snapshot));
  }

  private deepestTitleKey(snapshot: RouterStateSnapshot): string | null {
    let route = snapshot.root;
    while (route.firstChild) route = route.firstChild;
    return (route.data['titleKey'] as string | undefined) ?? null;
  }
}
