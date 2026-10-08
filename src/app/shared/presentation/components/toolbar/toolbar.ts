import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../icon/icon';
import { LanguageSwitcher } from '../language-switcher/language-switcher';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { MonitoringStore } from '../../../../service-execution-monitoring/application/monitoring.store';

/**
 * Top bar with the global monitoring status and the language selector.
 */
@Component({
  selector: 'app-toolbar',
  imports: [RouterLink, Icon, LanguageSwitcher, TranslatePipe],
  template: `
    <header class="topbar">
      <button type="button" class="icon-btn menu-toggle" [attr.aria-expanded]="menuOpen()"
              aria-controls="app-sidebar" [attr.aria-label]="'layout.toggleMenu' | translate" (click)="toggleMenu.emit()">
        <app-icon name="menu" [size]="20" />
      </button>
      @if (monitoringStore.ready()) {
        @if (monitoringStore.activeAlertCount() > 0) {
          <a class="status-pill alerta" routerLink="/monitoring/alerts" [queryParams]="{ status: 'ACTIVE' }">
            <i></i>{{ 'layout.status.alert' | translate: { count: monitoringStore.activeAlertCount() } }}
          </a>
        } @else {
          <span class="status-pill normal"><i></i>{{ 'layout.status.normal' | translate }}</span>
        }
      }
      <div class="spacer"></div>
      <app-language-switcher />
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Toolbar {
  protected readonly monitoringStore = inject(MonitoringStore);

  readonly menuOpen = input(false);
  readonly toggleMenu = output<void>();
}
