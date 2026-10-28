import { Component, input, linkedSignal, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

/**
 * Profile photo, or the default image when there is none or the link cannot be loaded
 * (US-06, scenario 2).
 */
@Component({
  selector: 'app-profile-avatar',
  imports: [MatIconModule],
  templateUrl: './profile-avatar.html',
  styleUrl: './profile-avatar.css',
  host: { '[style.--avatar-size.px]': 'size()' },
})
export class ProfileAvatar {
  /** URL of the profile photo, or `null` to show the default avatar. */
  readonly photoUrl = input<string | null>(null);
  /** Accessible alternative text for the avatar image. */
  readonly alt = input.required<string>();
  /** Avatar size in pixels. */
  readonly size = input(112);

  /** Emits when the profile photo has loaded successfully. */
  readonly loaded = output<void>();
  /** Emits when the profile photo fails to load. */
  readonly loadFailed = output<void>();

  /** Resets whenever another link arrives, so a new photo gets its own chance to load. */
  protected readonly failed = linkedSignal({ source: this.photoUrl, computation: () => false });

  /** Marks the current photo as failed and notifies the parent component. */
  protected onError(): void {
    this.failed.set(true);
    this.loadFailed.emit();
  }
}
