const codePattern = /^\d{6}$/;

/**
 * 6-digit code that confirms a password recovery.
 */
export class PasswordResetCode {
  /** Number of digits required for a password reset code. */
  static readonly length = 6;

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

  /**
   * Generates a six-digit password reset code.
   *
   * @returns A new password reset code.
   */
  static generate(): PasswordResetCode {
    const [random] = crypto.getRandomValues(new Uint32Array(1));
    return new PasswordResetCode((random % 1_000_000).toString().padStart(PasswordResetCode.length, '0'));
  }

  /**
   * Checks whether a candidate matches this code after trimming whitespace.
   *
   * @param code - Candidate code to compare.
   * @returns `true` if the candidate matches; otherwise, `false`.
   */
  matches(code: string): boolean {
    return this.value === code.trim();
  }
}
