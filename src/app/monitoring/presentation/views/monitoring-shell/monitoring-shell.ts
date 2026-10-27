import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MonitoringTabs } from '../../components/monitoring-tabs/monitoring-tabs';

/**
 * Container of the Monitoring sections: shows the module tabs above the active view.
 */
@Component({
  selector: 'app-monitoring-shell',
  imports: [RouterOutlet, MonitoringTabs],
  template: `
    <app-monitoring-tabs />
    <router-outlet />
  `,
  styleUrl: './monitoring-shell.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MonitoringShell {}
