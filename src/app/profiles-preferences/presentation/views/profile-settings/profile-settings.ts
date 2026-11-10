import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { Callout } from '../../../../shared/presentation/components/callout/callout';
import { PageState } from '../../../../shared/presentation/components/page-state/page-state';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { ProfilesStore } from '../../../application/profiles.store';
import { ProfileDetailsForm } from '../../components/profile-details-form/profile-details-form';
import { ProfilePhotoCard } from '../../components/profile-photo-card/profile-photo-card';
import { SubscriptionSummaryCard } from '../../components/subscription-summary-card/subscription-summary-card';

/**
 * My profile: view and edit the user details, see the subscription
 * status and Log Out.
 */
@Component({
  selector: 'app-profile-settings',
  imports: [
    Callout,
    MatButtonModule,
    MatIconModule,
    PageState,
    ProfileDetailsForm,
    ProfilePhotoCard,
    SubscriptionSummaryCard,
    TranslatePipe,
  ],
  templateUrl: './profile-settings.html',
  styleUrls: ['../../../../shared/presentation/styles/page.css', './profile-settings.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileSettings {
  /** Profiles state used to load and manage the profile and subscription. */
  protected readonly store = inject(ProfilesStore);
  private readonly router = inject(Router);

  constructor() {
    void this.store.load();
  }

  /** Signs out the user and navigates to the sign-in page. */
  protected signOut(): void {
    this.store.signOut();
    void this.router.navigate(this.store.signInRoute);
  }
}
