const supportedExtensions = ['.jpg', '.jpeg', '.png'];
const supportedProtocols = ['http:', 'https:'];

/**
 * Profile photo, stored as a link to the image. Only JPG and PNG images are supported
 * (mock-up 12); the REST API answers 415 to any other format (TS-04).
 */
export class ProfilePhoto {
  /** Validated URL of the profile photo. */
  readonly url: string;

  /**
   * Creates a profile photo value object.
   *
   * @param url - HTTP or HTTPS URL ending in a supported image extension.
   * @throws {Error} If the URL is invalid or the image format is unsupported.
   */
  constructor(url: string) {
    if (!ProfilePhoto.isValid(url)) {
      throw new Error(`Unsupported profile photo: ${url}`);
    }
    this.url = url.trim();
  }

  /**
   * Checks whether a URL uses a supported protocol and image extension.
   *
   * @param url - Photo URL to validate.
   * @returns `true` if the URL points to a JPG or PNG image over HTTP(S); otherwise, `false`.
   */
  static isValid(url: string): boolean {
    let parsed: URL;
    try {
      parsed = new URL(url.trim());
    } catch {
      return false;
    }
    const path = parsed.pathname.toLowerCase();
    return (
      supportedProtocols.includes(parsed.protocol) &&
      supportedExtensions.some((extension) => path.endsWith(extension))
    );
  }
}
