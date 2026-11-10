const codePattern = /^\d{6}$/;

/**
 * 6-digit code that confirms a password recovery. The platform emails it and keeps it valid for
 * 15 minutes.
 */
export class PasswordResetCode {
  /** Number of digits required for a password reset code. */
  static readonly length = 6;

  /** Number of minutes for which a code remains valid. */
  static readonly validityInMinutes = 15;

  /** The validated six-digit reset code. */
  readonly value: string;

  /**
   * Creates a password reset code.
   *
   * @param value - Six-digit code to validate and store.
   * @throws {Error} If the value does not contain exactly six digits.
   */
  constructor(value: string) {
    if (!PasswordResetCode.isValid(value)) {
      throw new Error('A password reset code must have exactly 6 digits');
    }
    this.value = value;
  }

  /**
   * Checks whether a value contains exactly the required number of digits.
   *
   * @param value - Code to validate.
   * @returns `true` if the value is a six-digit code; otherwise, `false`.
   */
  static isValid(value: string): boolean {
    return codePattern.test(value);
  }
}
