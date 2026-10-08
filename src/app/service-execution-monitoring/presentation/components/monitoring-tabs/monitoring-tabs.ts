import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Icon } from '../../../../shared/presentation/components/icon/icon';
import { IconName } from '../../../../shared/presentation/components/icon/icon-paths';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { MonitoringStore } from '../../../application/monitoring.store';

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
          @if (tab.path === '/monitoring/alerts' && store.activeAlertCount() > 0) {
            <span class="count" [attr.aria-label]="'monitoring.nav.pendingCount' | translate: { count: store.activeAlertCount() }">
              {{ store.activeAlertCount() }}
            </span>
          }
        </a>
      }
    </nav>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MonitoringTabs {
  protected readonly store = inject(MonitoringStore);

  protected readonly tabs: MonitoringTab[] = [
    { path: '/monitoring/overview', label: 'monitoring.nav.overview', icon: 'dashboard' },
    { path: '/monitoring/alerts', label: 'monitoring.nav.alerts', icon: 'bell' },
    { path: '/monitoring/consumption', label: 'monitoring.nav.consumption', icon: 'gauge' },
    { path: '/monitoring/rules', label: 'monitoring.nav.rules', icon: 'sliders' },
  ];
}
