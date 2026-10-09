import { Component, input, ViewEncapsulation } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { LanguageSwitcher } from '../../../../shared/presentation/components/language-switcher/language-switcher';
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
    TranslatePipe,
  ],
  templateUrl: './authentication-layout.html',
  styleUrl: './authentication-layout.css',
  encapsulation: ViewEncapsulation.None,
})
export class AuthenticationLayout {
  /** `wide` fits the registration forms (mock-ups 03 and 03b). */
  readonly width = input<'default' | 'wide'>('default');

  protected readonly appNav = appNav;
  protected readonly units = ['B-01', 'B-02', 'B-03', 'B-04', 'B-09', 'B-10', 'B-11', 'B-12'];
  protected readonly alertUnit = 'B-12';
}
