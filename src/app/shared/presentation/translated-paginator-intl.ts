import { effect, inject, Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { TranslationService } from '../infrastructure/i18n/translation.service';

/** Texts of the Material paginator in the active language. */
@Injectable()
export class TranslatedPaginatorIntl extends MatPaginatorIntl {
  private readonly i18n = inject(TranslationService);

  constructor() {
    super();
    effect(() => {
      this.nextPageLabel = this.i18n.t('common.pagination.next');
      this.previousPageLabel = this.i18n.t('common.pagination.previous');
      this.changes.next();
    });
  }

  override getRangeLabel = (page: number, pageSize: number, length: number): string => {
    const from = length === 0 ? 0 : page * pageSize + 1;
    const to = Math.min(length, (page + 1) * pageSize);
    return this.i18n.t('common.pagination.range', { from, to, total: length });
  };
}
