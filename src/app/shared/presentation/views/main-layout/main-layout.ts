import { Dialog } from '@angular/cdk/dialog';
import { BreakpointObserver } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterOutlet } from '@angular/router';
import { map } from 'rxjs';
import { SidebarNavigation } from '../../components/sidebar-navigation/sidebar-navigation';
import { Toolbar } from '../../components/toolbar/toolbar';
import { materialDefaults } from '../../material-defaults';

/**
 * Frame of the authenticated area. On narrow screens the side navigation floats over the content
 * and the menu button opens it. The dialog services are provided here so dialogs also get the
 * Material defaults.
 */
@Component({
  selector: 'app-main-layout',
  imports: [MatSidenavModule, RouterOutlet, SidebarNavigation, Toolbar],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
  providers: [Dialog, MatDialog, materialDefaults],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayout {
  protected readonly compact = toSignal(
    inject(BreakpointObserver)
      .observe('(max-width: 1024px)')
      .pipe(map((state) => state.matches)),
    { initialValue: false },
  );
}
