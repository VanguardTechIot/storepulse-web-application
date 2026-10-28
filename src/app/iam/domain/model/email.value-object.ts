const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Email address used as the sign-in identifier.
 *
 * The value is normalized by trimming whitespace and converting it to
 * lowercase before it is stored.
 */
export class Email {
  /** The normalized email address. */
  readonly value: string;

  /**
   * Creates an email value object.
   *
   * @param value - Email address to normalize and validate.
   * @throws {Error} If the normalized value is not a valid email address.
   */
  constructor(value: string) {
    const normalized = Email.normalize(value);
    if (!Email.isValid(normalized)) {
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
   * Checks whether a value matches the email format used by this class.
   *
   * @param value - Email address to validate.
   * @returns `true` if the normalized value matches the email pattern;
   * otherwise, `false`.
   */
  static isValid(value: string): boolean {
    return emailPattern.test(Email.normalize(value));
  }
}
