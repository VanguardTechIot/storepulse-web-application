import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { Profile } from '../domain/model/profile.entity';
import { ProfileOwner } from '../domain/model/profile-owner';
import { ProfilesError, ProfilesErrorCode } from '../domain/model/profiles-error';
import { SubscriptionSummary } from '../domain/model/subscription-summary.value-object';
import { UpdateProfilePhotoCommand } from '../domain/model/update-profile-photo.command';
import { UpdateProfileCommand } from '../domain/model/update-profile.command';
import { IamContextFacade } from '../infrastructure/acl/iam-context-facade';
import { SubscriptionsContextFacade } from '../infrastructure/acl/subscriptions-context-facade';
import { PROFILES_REPOSITORY } from '../infrastructure/profiles.token';

/**
 * Application service of Profiles and Preferences: coordinates the use cases of the profile of
 * the signed-in user and keeps its state.
 *
 * Each operation resolves to `true` when it succeeds. On failure it resolves to `false` and
 * exposes the reason in `error` (a `ProfilesErrorCode`, translated as `profiles.errors.<code>`).
 */
@Injectable({ providedIn: 'root' })
export class ProfilesStore {
  private readonly repository = inject(PROFILES_REPOSITORY);
  private readonly iamContext = inject(IamContextFacade);
  private readonly subscriptionsContext = inject(SubscriptionsContextFacade);

  private readonly profileState = signal<Profile | null>(null);
  private readonly subscriptionState = signal<SubscriptionSummary | null>(null);

  readonly profile = this.profileState.asReadonly();
  /** Shown next to the profile (US-45); `null` when there is none or it cannot be read. */
  readonly subscription = this.subscriptionState.asReadonly();
  readonly owner = this.iamContext.currentOwner;
  readonly signInRoute = this.iamContext.signInRoute;
  readonly manageSubscriptionRoute = this.subscriptionsContext.manageRoute;
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<ProfilesErrorCode | null>(null);

  /** Profile of the signed-in user (US-06) and the subscription of the gallery (US-45). */
  load(): Promise<boolean> {
    return this.execute(this.loading, async () => {
      const owner = this.requireOwner();
      if (this.profileState()?.userId !== owner.userId) {
        this.profileState.set(null);
      }
      const [profile, subscription] = await Promise.all([
        this.repository.getProfile(owner.userId),
        this.subscriptionsContext.getSubscriptionSummary().catch(() => null),
      ]);
      this.profileState.set(profile);
      this.subscriptionState.set(subscription);
    });
  }

  /** Saves the edited details (US-07). A new email also becomes the sign-in email. */
  updateProfile(command: UpdateProfileCommand): Promise<boolean> {
    return this.execute(this.saving, async () => {
      const current = this.requireProfile();
      const saved = await this.repository.updateProfile(current.update(command));
      this.profileState.set(saved);
      if (saved.email !== current.email) {
        this.iamContext.syncAccountEmail(saved.email);
      }
    });
  }

  /** Sets or removes the photo link (US-07, scenario 3). */
  updatePhoto(command: UpdateProfilePhotoCommand): Promise<boolean> {
    return this.execute(this.saving, async () => {
      const profile = this.requireProfile().changePhoto(command);
      this.profileState.set(await this.repository.updateProfile(profile));
    });
  }

  /** Log Out from My profile (US-04). */
  signOut(): void {
    this.iamContext.signOut();
    this.profileState.set(null);
    this.subscriptionState.set(null);
  }

  clearError(): void {
    this.error.set(null);
  }

  private requireOwner(): ProfileOwner {
    const owner = this.owner();
    if (!owner) throw new ProfilesError(ProfilesErrorCode.ProfileNotFound);
    return owner;
  }

  private requireProfile(): Profile {
    const profile = this.profileState();
    if (!profile) throw new ProfilesError(ProfilesErrorCode.ProfileNotFound);
    return profile;
  }

  private async execute(
    busy: WritableSignal<boolean>,
    operation: () => Promise<void>,
  ): Promise<boolean> {
    busy.set(true);
    this.error.set(null);
    try {
      await operation();
      return true;
    } catch (error) {
      if (!(error instanceof ProfilesError)) console.error('[Profiles]', error);
      this.error.set(error instanceof ProfilesError ? error.code : ProfilesErrorCode.Unexpected);
      return false;
    } finally {
      busy.set(false);
    }
  }
}
