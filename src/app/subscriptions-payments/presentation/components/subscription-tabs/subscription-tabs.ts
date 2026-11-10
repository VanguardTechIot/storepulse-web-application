import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';

/** Navigation between the subscription sections. */
@Component({
  selector: 'app-subscription-tabs',
  imports: [MatTabsModule, RouterLink, RouterLinkActive, TranslatePipe],
  templateUrl: './subscription-tabs.html',
  styleUrl: './subscription-tabs.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubscriptionTabs {
  protected readonly tabs = [
    { id: 'status-tab', path: '/subscription/status', label: 'subscriptions.tabs.status' },
    { id: 'plans-tab', path: '/subscription/plans', label: 'subscriptions.tabs.plans' },
    { id: 'payments-tab', path: '/subscription/payments', label: 'subscriptions.tabs.payments' },
  ];
}
