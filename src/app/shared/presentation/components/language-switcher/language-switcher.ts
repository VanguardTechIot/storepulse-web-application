import { Component, inject } from '@angular/core';
import { MatButtonToggleChange, MatButtonToggleModule } from '@angular/material/button-toggle';
import { TranslatePipe } from '@ngx-translate/core';
import {
  LanguageService,
  SupportedLanguage,
  supportedLanguages,
} from '../../../infrastructure/language.service';

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
  private readonly languageService = inject(LanguageService);

  protected readonly languages = supportedLanguages;
  protected readonly currentLanguage = this.languageService.currentLanguage;

  protected select(change: MatButtonToggleChange): void {
    this.languageService.use(change.value as SupportedLanguage).subscribe();
  }
}
