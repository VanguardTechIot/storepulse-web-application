import { effect, inject, Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { TranslationService } from '../infrastructure/translation.service';

/**
 * Route titles are localization keys; the document title follows the current language.
 */
@Injectable({ providedIn: 'root' })
export class TranslatedTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly translation = inject(TranslationService);
  private currentKey: string | undefined;

  constructor() {
    super();
    effect(() => {
      this.translation.language();
      this.apply();
    });
  }

  override updateTitle(snapshot: RouterStateSnapshot): void {
    this.currentKey = this.buildTitle(snapshot);
    this.apply();
  }

  private apply(): void {
    const appName = this.translation.translate('app.name');
    this.title.setTitle(this.currentKey ? `${this.translation.translate(this.currentKey)} · ${appName}` : appName);
  }
}
