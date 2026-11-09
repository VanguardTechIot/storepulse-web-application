import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { appNav } from '../../../../shared/routing/app-nav';
import { AnalyticsStore } from '../../../application/analytics.store';

/** Open alerts of the gallery in the top bar: a chip while any is open and the bell to the Alert Center. */
@Component({
  selector: 'app-open-alerts-indicator',
  imports: [MatBadgeModule, MatButtonModule, MatIconModule, RouterLink, TranslatePipe],
  templateUrl: './open-alerts-indicator.html',
  styleUrl: './open-alerts-indicator.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OpenAlertsIndicator {
  private readonly store = inject(AnalyticsStore);

  protected readonly count = computed(() => this.store.openAlerts().length);
  protected readonly alertsRoute = appNav.alerts;

  constructor() {
    // The bell stays usable without counters when the platform cannot be reached.
    this.store.load().catch(() => undefined);
  }
}
