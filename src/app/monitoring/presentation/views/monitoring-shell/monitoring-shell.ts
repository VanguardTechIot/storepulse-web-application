import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SectionTabs } from '../../../../shared/presentation/components/section-tabs/section-tabs';
import { monitoringTabs } from '../../monitoring.tabs';

@Component({
  selector: 'app-monitoring-shell',
  imports: [RouterOutlet, SectionTabs],
  templateUrl: './monitoring-shell.html',
  styleUrl: './monitoring-shell.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MonitoringShell {
  protected readonly tabs = monitoringTabs;
}
