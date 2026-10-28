const phonePattern = /^\+?[\d\s()-]+$/;
const minDigits = 7;
const maxDigits = 15;

/**
 * Contact phone of the profile, e.g. `+51 987 654 321`: an optional leading `+` and 7 to 15
 * digits (the E.164 maximum), which may be separated by spaces, hyphens or parentheses.
 */
export class PhoneNumber {
  /** Normalized phone number, with consecutive whitespace reduced to a single space. */
  readonly value: string;

  /**
   * Creates a phone number value object.
   *
   * @param value - Phone number to validate and normalize.
   * @throws {Error} If the value does not match the supported phone number format.
   */
  constructor(value: string) {
    if (!PhoneNumber.isValid(value)) {
      throw new Error(`Invalid phone number: ${value}`);
    }
    this.value = PhoneNumber.normalize(value);
  }

  /**
   * Trims whitespace and reduces consecutive whitespace to a single space.
   *
   * @param value - Phone number to normalize.
   * @returns The normalized phone number.
   */
  static normalize(value: string): string {
    return value.trim().replace(/\s+/g, ' ');
  }

  /**
   * Checks whether a phone number uses the supported format and digit count.
   *
   * @param value - Phone number to validate.
   * @returns `true` if valid; otherwise, `false`.
   */
  static isValid(value: string): boolean {
    const normalized = PhoneNumber.normalize(value);
    const digits = normalized.replace(/\D/g, '').length;
    return phonePattern.test(normalized) && digits >= minDigits && digits <= maxDigits;
  }
}
