import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarNavigation } from '../../components/sidebar-navigation/sidebar-navigation';
import { Toolbar } from '../../components/toolbar/toolbar';
import { SkipLink } from '../../components/skip-link/skip-link';

/**
 * Application shell: side navigation, top bar and routed content.
 */
@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, SidebarNavigation, Toolbar, SkipLink],
  template: `
    <app-skip-link />
    <div class="app">
      <app-sidebar-navigation id="app-sidebar" [open]="menuOpen()" (navigate)="menuOpen.set(false)" />
      @if (menuOpen()) {
        <div class="sidenav-backdrop" (click)="menuOpen.set(false)"></div>
      }
      <div class="main">
        <app-toolbar [menuOpen]="menuOpen()" (toggleMenu)="menuOpen.set(!menuOpen())" />
        <main id="main-content" class="content" tabindex="-1">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  host: { '(document:keydown.escape)': 'menuOpen.set(false)' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayout {
  protected readonly menuOpen = signal(false);
}
