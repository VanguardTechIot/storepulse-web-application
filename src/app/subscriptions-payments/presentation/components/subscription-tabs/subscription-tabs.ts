import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';

/**
 * Navigation between the sections of the Subscription module.
 */
@Component({
  selector: 'app-subscription-tabs',
  imports: [MatTabsModule, RouterLink, RouterLinkActive, TranslatePipe],
  template: `
    <nav
      mat-tab-nav-bar
      mat-stretch-tabs="false"
      mat-align-tabs="start"
      [tabPanel]="panel"
      [attr.aria-label]="'subscriptions.tabs.label' | translate"
    >
      @for (tab of tabs; track tab.path) {
        <a
          mat-tab-link
          [routerLink]="tab.path"
          routerLinkActive
          #rla="routerLinkActive"
          [active]="rla.isActive"
        >
          {{ tab.label | translate }}
        </a>
      }
    </nav>
    <mat-tab-nav-panel #panel />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubscriptionTabs {
  protected readonly tabs = [
    { path: '/subscription/status', label: 'subscriptions.tabs.status' },
    { path: '/subscription/plans', label: 'subscriptions.tabs.plans' },
    { path: '/subscription/payments', label: 'subscriptions.tabs.payments' },
  ];
}
