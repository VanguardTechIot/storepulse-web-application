import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Language, TranslationService } from '../../../infrastructure/translation.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

/**
 * EN / ES selector shown in the toolbar.
 */
@Component({
  selector: 'app-language-switcher',
  imports: [TranslatePipe],
  template: `
    <div class="lang" role="group" [attr.aria-label]="'layout.language' | translate">
      @for (option of options; track option.code) {
        <button type="button" [class.on]="translation.language() === option.code"
                [attr.aria-pressed]="translation.language() === option.code"
                [attr.lang]="option.code" (click)="select(option.code)">
          {{ option.label }}
        </button>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LanguageSwitcher {
  protected readonly translation = inject(TranslationService);
  protected readonly options: { code: Language; label: string }[] = [
    { code: 'en-US', label: 'EN' },
    { code: 'es-419', label: 'ES' },
  ];

  protected select(language: Language): void {
    void this.translation.use(language);
  }
}
