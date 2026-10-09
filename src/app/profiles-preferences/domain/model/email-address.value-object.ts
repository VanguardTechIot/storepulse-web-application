const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Email of the profile. It is also the sign-in email, so it follows the same rule as Identity and
 * Access Management: always stored trimmed and in lower case.
 */
export class EmailAddress {
  readonly value: string;

  constructor(value: string) {
    const normalized = EmailAddress.normalize(value);
    if (!EmailAddress.isValid(normalized)) {
      throw new Error(`Invalid email: ${value}`);
    }
    this.value = normalized;
  }

  static normalize(value: string): string {
    return value.trim().toLowerCase();
  }

  static isValid(value: string): boolean {
    return emailPattern.test(EmailAddress.normalize(value));
  }
}
