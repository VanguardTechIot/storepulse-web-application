import { inject, Pipe, PipeTransform } from '@angular/core';
import { TranslationService } from '../../infrastructure/translation.service';

/**
 * Resolves a localization key for the current language. Impure so it reacts to language changes.
 */
@Pipe({ name: 'translate', pure: false })
export class TranslatePipe implements PipeTransform {
  private readonly translation = inject(TranslationService);

  transform(key: string, params?: Record<string, string | number>): string {
    return this.translation.translate(key, params);
  }
}
