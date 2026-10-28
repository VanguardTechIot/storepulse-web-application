/**
 * Sets the link of a new profile photo (US-07, scenario 3), or removes it with `null` so the
 * default image is shown again (US-06, scenario 2).
 */
export class UpdateProfilePhotoCommand {
  /** New photo URL, or `null` to remove the current photo. */
  readonly photoUrl: string | null;

  /**
   * Creates a command to set or remove a profile photo.
   *
   * @param command - Profile photo URL or `null` to remove the photo.
   */
  constructor(command: { photoUrl: string | null }) {
    this.photoUrl = command.photoUrl;
  }
}
