import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { Callout } from '../../../../shared/presentation/components/callout/callout';
import { LocalizedDatePipe } from '../../../../shared/presentation/pipes/localized-date.pipe';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { ProfilesStore } from '../../../application/profiles.store';
import { SubscriptionStatus } from '../../../domain/model/subscription-status.enum';

const statusTones: Record<SubscriptionStatus, string> = {
  [SubscriptionStatus.Active]: 'badge--success',
  [SubscriptionStatus.ExpiringSoon]: 'badge--warning',
  [SubscriptionStatus.Expired]: 'badge--danger',
};

/**
 * Subscription of the gallery as seen from My profile (US-45): plan, status, expiration date and
 * a notice when the renewal is near. It is managed in Subscriptions and Payments.
 */
@Component({
  selector: 'app-subscription-summary-card',
  imports: [Callout, LocalizedDatePipe, MatButtonModule, MatCardModule, RouterLink, TranslatePipe],
  templateUrl: './subscription-summary-card.html',
  styleUrl: './subscription-summary-card.css',
})
export class SubscriptionSummaryCard {
  protected readonly store = inject(ProfilesStore);
  protected readonly statusTones = statusTones;
}
