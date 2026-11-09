import { Provider } from '@angular/core';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { TranslatedPaginatorIntl } from './translated-paginator-intl';

/**
 * Material defaults of the screens. The layouts provide them instead of `app.config.ts`, so the
 * form field code stays out of the initial bundle.
 */
export const materialDefaults: Provider[] = [
  { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'outline' } },
  { provide: MatPaginatorIntl, useClass: TranslatedPaginatorIntl },
];
