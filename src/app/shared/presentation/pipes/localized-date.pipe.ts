import { inject, Pipe, PipeTransform } from '@angular/core';
import { TranslationService } from '../../infrastructure/i18n/translation.service';

export type DateFormat = 'date' | 'time' | 'dateTime' | 'monthYear' | 'shortMonth';

const FORMATS: Record<DateFormat, Intl.DateTimeFormatOptions> = {
  date: { day: '2-digit', month: '2-digit', year: 'numeric' },
  time: { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false },
  dateTime: { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false },
  monthYear: { month: 'long', year: 'numeric' },
  shortMonth: { month: 'short' },
};

/**
 * Formats dates with the locale of the current language.
 */
@Pipe({ name: 'localizedDate', pure: false })
export class LocalizedDatePipe implements PipeTransform {
  private readonly translation = inject(TranslationService);

  transform(value: Date | null | undefined, format: DateFormat = 'dateTime'): string {
    if (!value) return '—';
    return new Intl.DateTimeFormat(this.translation.lang(), FORMATS[format]).format(value);
  }
}
