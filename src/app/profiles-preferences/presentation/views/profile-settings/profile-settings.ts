import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { Callout } from '../../../../shared/presentation/components/callout/callout';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { ProfilesStore } from '../../../application/profiles.store';
import { ProfileDetailsForm } from '../../components/profile-details-form/profile-details-form';
import { ProfilePhotoCard } from '../../components/profile-photo-card/profile-photo-card';
import { SubscriptionSummaryCard } from '../../components/subscription-summary-card/subscription-summary-card';

/**
 * My profile (mock-up 12): view and edit the user details (US-06, US-07), see the subscription
 * status (US-45) and Log Out (US-04).
 */
@Component({
  selector: 'app-profile-settings',
  imports: [
    Callout,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    ProfileDetailsForm,
    ProfilePhotoCard,
    SubscriptionSummaryCard,
    TranslatePipe,
  ],
  templateUrl: './profile-settings.html',
  styleUrl: './profile-settings.css',
})
export class ProfileSettings {
  protected readonly store = inject(ProfilesStore);
  private readonly router = inject(Router);

  constructor() {
    void this.store.load();
  }

  protected signOut(): void {
    this.store.signOut();
    void this.router.navigate(this.store.signInRoute);
  }
}
