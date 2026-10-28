import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SubscriptionsStore } from '../../../application/subscriptions.store';
import { SubscriptionTabs } from '../../components/subscription-tabs/subscription-tabs';

/** Container of the subscription sections: loads the data once and shows the section tabs. */
@Component({
  selector: 'app-subscription-shell',
  imports: [RouterOutlet, SubscriptionTabs],
  templateUrl: './subscription-shell.html',
  styleUrls: [
    '../../../../shared/presentation/styles/storepulse-theme.css',
    '../../../../shared/presentation/styles/page.css',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubscriptionShell {
  private readonly store = inject(SubscriptionsStore);

  constructor() {
    if (!this.store.loaded()) this.store.load();
  }
}
