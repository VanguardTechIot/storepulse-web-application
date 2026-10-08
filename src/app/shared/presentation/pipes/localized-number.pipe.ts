import { inject, Pipe, PipeTransform } from '@angular/core';
import { TranslationService } from '../../infrastructure/i18n/translation.service';

/**
 * Formats numbers with the locale of the current language.
 */
@Pipe({ name: 'localizedNumber', pure: false })
export class LocalizedNumberPipe implements PipeTransform {
  private readonly translation = inject(TranslationService);

  transform(value: number | null | undefined, maximumFractionDigits = 2, signed = false): string {
    if (value === null || value === undefined) return '—';
    return new Intl.NumberFormat(this.translation.lang(), {
      maximumFractionDigits,
      minimumFractionDigits: 0,
      signDisplay: signed ? 'exceptZero' : 'auto',
    }).format(value);
  }
}
