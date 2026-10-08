const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Email used as the sign-in identifier. Always stored trimmed and in lower case.
 */
export class Email {
  readonly value: string;

  constructor(value: string) {
    const normalized = Email.normalize(value);
    if (!Email.isValid(normalized)) {
      throw new Error(`Invalid email: ${value}`);
    }
    this.value = normalized;
  }

  static normalize(value: string): string {
    return value.trim().toLowerCase();
  }

  static isValid(value: string): boolean {
    return emailPattern.test(Email.normalize(value));
  }
}
