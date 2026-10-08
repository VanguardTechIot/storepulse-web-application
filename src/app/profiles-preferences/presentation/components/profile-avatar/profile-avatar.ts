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
  readonly photoUrl = input<string | null>(null);
  readonly alt = input.required<string>();
  readonly size = input(112);

  readonly loaded = output<void>();
  readonly loadFailed = output<void>();

  /** Resets whenever another link arrives, so a new photo gets its own chance to load. */
  protected readonly failed = linkedSignal({ source: this.photoUrl, computation: () => false });

  protected onError(): void {
    this.failed.set(true);
    this.loadFailed.emit();
  }
}
