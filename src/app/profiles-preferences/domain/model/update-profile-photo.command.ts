/**
 * Sets the link of a new profile photo (US-07, scenario 3), or removes it with `null` so the
 * default image is shown again (US-06, scenario 2).
 */
export class UpdateProfilePhotoCommand {
  readonly photoUrl: string | null;

  constructor(command: { photoUrl: string | null }) {
    this.photoUrl = command.photoUrl;
  }
}
