import { inject, Pipe, PipeTransform } from '@angular/core';
import {
  TranslationParams,
  TranslationService,
} from '../../infrastructure/i18n/translation.service';

/** Uso en templates: {{ 'nav.billing' | translate }} o {{ 'iam.x' | translate: { count: 8 } }} */
@Pipe({
  name: 'translate',
  pure: false,
  standalone: true,
})
export class TranslatePipe implements PipeTransform {
  private readonly i18n: TranslationService = inject(TranslationService);

  transform(key: string, params?: TranslationParams): string {
    return this.i18n.t(key, params);
  }
}
