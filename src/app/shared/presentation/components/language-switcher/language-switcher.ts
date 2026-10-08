import { Component, inject } from '@angular/core';
import { MatButtonToggleChange, MatButtonToggleModule } from '@angular/material/button-toggle';
import { Lang, TranslationService } from '../../../infrastructure/i18n/translation.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

/**
 * EN / ES selector shown on every screen (5.1 bilingual guideline).
 */
@Component({
  selector: 'app-language-switcher',
  imports: [MatButtonToggleModule, TranslatePipe],
  templateUrl: './language-switcher.html',
  styleUrl: './language-switcher.css',
})
export class LanguageSwitcher {
  protected readonly i18n = inject(TranslationService);

  protected readonly languages: { code: Lang; label: string; nameKey: string }[] = [
    { code: 'en-US', label: 'EN', nameKey: 'common.language.english' },
    { code: 'es-419', label: 'ES', nameKey: 'common.language.spanish' },
  ];

  protected select(change: MatButtonToggleChange): void {
    void this.i18n.setLang(change.value as Lang);
  }
}
