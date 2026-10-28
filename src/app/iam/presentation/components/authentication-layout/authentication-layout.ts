import { Component, ViewEncapsulation } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { LanguageSwitcher } from '../../../../shared/presentation/components/language-switcher/language-switcher';
import { StatusChip } from '../../../../shared/presentation/components/status-chip/status-chip';
import { ToneIcon } from '../../../../shared/presentation/components/tone-icon/tone-icon';
import { appNav } from '../../../../shared/routing/app-nav';

/**
 * Pre-login frame (mock-ups 01, 02, 02a, 03): brand panel on the left, form on the right.
 * Views project their header actions with the `authTop` attribute and their form as content.
 * Styles are not encapsulated so they also apply to the projected form; every class is
 * prefixed with `auth-`.
 */
@Component({
  selector: 'app-authentication-layout',
  imports: [
    LanguageSwitcher,
    MatCardModule,
    MatChipsModule,
    MatGridListModule,
    MatIconModule,
    RouterLink,
    StatusChip,
    ToneIcon,
    TranslatePipe,
  ],
  templateUrl: './authentication-layout.html',
  styleUrl: './authentication-layout.css',
  encapsulation: ViewEncapsulation.None,
})
export class AuthenticationLayout {
  /** Navigation commands for the main application. */
  protected readonly appNav = appNav;
  /** Unit identifiers displayed in the decorative building panel. */
  protected readonly units = ['B-01', 'B-02', 'B-03', 'B-04', 'B-09', 'B-10', 'B-11', 'B-12'];
  /** Unit identifier highlighted with an alert in the decorative panel. */
  protected readonly alertUnit = 'B-12';
}
