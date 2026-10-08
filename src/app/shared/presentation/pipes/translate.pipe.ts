import { inject, Pipe, PipeTransform } from '@angular/core';
import { TranslationService } from '../../infrastructure/i18n/translation.service';

/** Uso en templates: {{ 'nav.billing' | translate }} */
@Pipe({
  name: 'translate',
  pure: false,
  standalone: true,
})
export class TranslatePipe implements PipeTransform {
  private readonly i18n: TranslationService = inject(TranslationService);

  transform(key: string): string {
    return this.i18n.t(key);
  }
}
