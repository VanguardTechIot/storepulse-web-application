import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RouterOutlet } from '@angular/router';
import { SidebarNavigation } from '../../components/sidebar-navigation/sidebar-navigation';
import { Toolbar } from '../../components/toolbar/toolbar';
import { materialDefaults } from '../../material-defaults';

/**
 * Frame of the authenticated area. The dialog services are provided here so dialogs also get the
 * Material defaults.
 */
@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, SidebarNavigation, Toolbar],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
  providers: [Dialog, MatDialog, materialDefaults],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayout {}
