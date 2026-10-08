const supportedExtensions = ['.jpg', '.jpeg', '.png'];
const supportedProtocols = ['http:', 'https:'];

/**
 * Profile photo, stored as a link to the image. Only JPG and PNG images are supported
 * (mock-up 12); the REST API answers 415 to any other format (TS-04).
 */
export class ProfilePhoto {
  readonly url: string;

  constructor(url: string) {
    if (!ProfilePhoto.isValid(url)) {
      throw new Error(`Unsupported profile photo: ${url}`);
    }
    this.url = url.trim();
  }

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
