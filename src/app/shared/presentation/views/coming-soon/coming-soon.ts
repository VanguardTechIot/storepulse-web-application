import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslationService } from '../../../infrastructure/i18n/translation.service';

@Component({
  selector: 'app-coming-soon',
  template: `
    <h1 class="page-title">{{ i18n.t(titleKey) }}</h1>
    <p class="page-subtitle">{{ i18n.t('common.coming_soon') }}</p>
  `,
  styles: `
    .page-title { margin: 0; font-size: 22px; font-weight: 600; }
    .page-subtitle { margin: 4px 0 0; color: var(--sp-text-muted); }
  `,
})
export class ComingSoon {
  protected readonly i18n = inject(TranslationService);
  private readonly route = inject(ActivatedRoute);
  protected readonly titleKey = this.route.snapshot.data['titleKey'] as string;
}
