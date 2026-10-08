const phonePattern = /^\+?[\d\s()-]+$/;
const minDigits = 7;
const maxDigits = 15;

/**
 * Contact phone of the profile, e.g. `+51 987 654 321`: an optional leading `+` and 7 to 15
 * digits (the E.164 maximum), which may be separated by spaces, hyphens or parentheses.
 */
export class PhoneNumber {
  readonly value: string;

  constructor(value: string) {
    if (!PhoneNumber.isValid(value)) {
      throw new Error(`Invalid phone number: ${value}`);
    }
    this.value = PhoneNumber.normalize(value);
  }

  static normalize(value: string): string {
    return value.trim().replace(/\s+/g, ' ');
  }

  static isValid(value: string): boolean {
    const normalized = PhoneNumber.normalize(value);
    const digits = normalized.replace(/\D/g, '').length;
    return phonePattern.test(normalized) && digits >= minDigits && digits <= maxDigits;
  }
}
