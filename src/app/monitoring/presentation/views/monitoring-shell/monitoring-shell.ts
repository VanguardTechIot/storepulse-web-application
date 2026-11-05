import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MonitoringTabs } from '../../components/monitoring-tabs/monitoring-tabs';

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
