import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SubscriptionsStore } from '../../../application/subscriptions.store';
import { SubscriptionTabs } from '../../components/subscription-tabs/subscription-tabs';

/**
 * Container of the Subscription sections: loads the data once and shows the module tabs above
 * the active view.
 */
@Component({
  selector: 'app-subscription-shell',
  imports: [RouterOutlet, SubscriptionTabs],
  template: `
    <app-subscription-tabs />
    <router-outlet />
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubscriptionShell {
  private readonly store = inject(SubscriptionsStore);

  constructor() {
    if (!this.store.loaded()) this.store.load();
  }
}
