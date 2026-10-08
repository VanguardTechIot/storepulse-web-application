import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { map } from 'rxjs';
import { AuthenticationSection } from '../../../../identity-access-management/presentation/components/authentication-section/authentication-section';
import { appNav } from '../../../routing/app-nav';
import { LanguageSwitcher } from '../../components/language-switcher/language-switcher';

/**
 * Shell of the authenticated area (sidebar 260 px + top bar 64 px, 5.1 Style Guidelines).
 * As the composition root of the screen, it is the only shared piece that renders components
 * from a bounded context (the IAM account menu).
 */
@Component({
  selector: 'app-main-layout',
  imports: [
    AuthenticationSection,
    LanguageSwitcher,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatListModule,
    MatSidenavModule,
    MatToolbarModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    TranslatePipe,
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout {
  protected readonly isHandset = toSignal(
    inject(BreakpointObserver)
      .observe('(max-width: 959.98px)')
      .pipe(map((state) => state.matches)),
    { initialValue: false },
  );

  /** Modules of the sidebar. Each bounded context adds its entry when it is implemented. */
  protected readonly navigation = [{ label: 'shared.nav.home', icon: 'dashboard', link: appNav.home }];
  protected readonly appNav = appNav;

  protected skipToContent(event: Event, target: HTMLElement): void {
    event.preventDefault();
    target.focus();
  }
}
