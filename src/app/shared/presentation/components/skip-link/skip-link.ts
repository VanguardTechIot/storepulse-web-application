import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslatePipe } from '../../pipes/translate.pipe';

/**
 * Lets keyboard users jump straight to the main content.
 */
@Component({
  selector: 'app-skip-link',
  imports: [TranslatePipe],
  template: `<a class="skip-link" href="#main-content">{{ 'layout.skipToContent' | translate }}</a>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkipLink {}
