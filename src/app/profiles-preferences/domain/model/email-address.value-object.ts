const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Email of the profile. It is also the sign-in email, so it follows the same rule as Identity and
 * Access Management: always stored trimmed and in lower case.
 */
export class EmailAddress {
  /** Normalized email address. */
  readonly value: string;

  /**
   * Creates an email address value object.
   *
   * @param value - Email address to normalize and validate.
   * @throws {Error} If the normalized value is not a valid email address.
   */
  constructor(value: string) {
    const normalized = EmailAddress.normalize(value);
    if (!EmailAddress.isValid(normalized)) {
      throw new Error(`Invalid email: ${value}`);
    }
    this.value = normalized;
  }

  /**
   * Trims whitespace and converts an email address to lowercase.
   *
   * @param value - Email address to normalize.
   * @returns The normalized email address.
   */
  static normalize(value: string): string {
    return value.trim().toLowerCase();
  }

  /**
   * Checks whether a value matches the supported email format.
   *
   * @param value - Email address to validate.
   * @returns `true` if the normalized value matches the email pattern; otherwise, `false`.
   */
  static isValid(value: string): boolean {
    return emailPattern.test(EmailAddress.normalize(value));
  }
}
