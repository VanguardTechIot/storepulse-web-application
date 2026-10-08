import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Icon } from '../icon/icon';
import { IconName } from '../icon/icon-paths';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { MonitoringStore } from '../../../../service-execution-monitoring/application/monitoring.store';

interface NavItem {
  path: string;
  label: string;
  icon: IconName;
  exact?: boolean;
}

/**
 * Side navigation of the Web Application.
 */
@Component({
  selector: 'app-sidebar-navigation',
  imports: [RouterLink, RouterLinkActive, Icon, TranslatePipe],
  templateUrl: './sidebar-navigation.html',
  host: { '[class.open]': 'open()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarNavigation {
  protected readonly monitoringStore = inject(MonitoringStore);

  readonly open = input(false);
  readonly navigate = output<void>();

  protected readonly monitoringItems: NavItem[] = [
    { path: '/monitoring/overview', label: 'monitoring.nav.overview', icon: 'dashboard' },
    { path: '/monitoring/alerts', label: 'monitoring.nav.alerts', icon: 'bell' },
    { path: '/monitoring/consumption', label: 'monitoring.nav.consumption', icon: 'gauge' },
    { path: '/monitoring/rules', label: 'monitoring.nav.rules', icon: 'sliders' },
  ];

  protected readonly year = new Date().getFullYear();
}
