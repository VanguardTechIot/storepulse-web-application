import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Icon } from '../../../../shared/presentation/components/icon/icon';
import { IconName } from '../../../../shared/presentation/components/icon/icon-paths';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';

interface MonitoringTab {
  path: string;
  label: string;
  icon: IconName;
}

/**
 * Navigation between the sections of the Monitoring module.
 */
@Component({
  selector: 'app-monitoring-tabs',
  imports: [RouterLink, RouterLinkActive, Icon, TranslatePipe],
  template: `
    <nav class="monitoring-tabs" [attr.aria-label]="'monitoring.nav.section' | translate">
      @for (tab of tabs; track tab.path) {
        <a [routerLink]="tab.path" routerLinkActive="is-active" #rla="routerLinkActive"
           [attr.aria-current]="rla.isActive ? 'page' : null">
          <app-icon [name]="tab.icon" [size]="16" />
          {{ tab.label | translate }}
        </a>
      }
    </nav>
  `,
  styleUrl: './monitoring-tabs.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MonitoringTabs {
  protected readonly tabs: MonitoringTab[] = [
    { path: '/monitoring/overview', label: 'monitoring.nav.overview', icon: 'dashboard' },
    { path: '/monitoring/consumption', label: 'monitoring.nav.consumption', icon: 'gauge' },
  ];
}
