/**
 * Sets the link of a new profile photo, or removes it with `null` so the
 * default image is shown again.
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
