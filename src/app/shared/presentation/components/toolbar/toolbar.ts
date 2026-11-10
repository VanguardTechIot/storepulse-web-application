import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { OpenAlertsIndicator } from '../../../../dashboard-analytics';
import { AuthenticationSection } from '../../../../iam/presentation/components/authentication-section/authentication-section';
import { GalleryBadge } from '../../../../property-management';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { LanguageSwitcher } from '../language-switcher/language-switcher';

/**
 * Top bar of the authenticated area. The shell is the only shared piece that composes components
 * of the bounded contexts: the gallery, the open alerts and the account menu.
 */
@Component({
  selector: 'app-toolbar',
  imports: [
    AuthenticationSection,
    GalleryBadge,
    LanguageSwitcher,
    MatButtonModule,
    MatIconModule,
    OpenAlertsIndicator,
    TranslatePipe,
  ],
  templateUrl: './toolbar.html',
  styleUrl: './toolbar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Toolbar {
  /** Asks the layout to show or hide the side navigation. */
  readonly menu = output<void>();
}
