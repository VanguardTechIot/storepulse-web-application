import { inject, Pipe, PipeTransform } from '@angular/core';
import { TranslationService } from '../../infrastructure/i18n/translation.service';

/**
 * Formats an elapsed time in milliseconds as "1 h 4 min", "6 min 41 s" or "52 s".
 */
@Pipe({ name: 'duration', pure: false })
export class DurationPipe implements PipeTransform {
  private readonly translation = inject(TranslationService);

  transform(milliseconds: number | null | undefined): string {
    if (milliseconds === null || milliseconds === undefined) return '—';
    const totalSeconds = Math.max(0, Math.round(milliseconds / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const t = (key: string, value: number) => this.translation.t(`common.duration.${key}`, { value });
    if (hours > 0) return `${t('hours', hours)} ${t('minutes', minutes)}`;
    if (minutes > 0) return `${t('minutes', minutes)} ${t('seconds', seconds)}`;
    return t('seconds', seconds);
  }
}
