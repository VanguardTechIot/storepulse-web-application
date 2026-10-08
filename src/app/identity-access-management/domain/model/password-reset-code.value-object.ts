const codePattern = /^\d{6}$/;

/**
 * 6-digit code that confirms a password recovery.
 */
export class PasswordResetCode {
  static readonly length = 6;

  readonly value: string;

  constructor(value: string) {
    if (!PasswordResetCode.isValid(value)) {
      throw new Error('A password reset code must have exactly 6 digits');
    }
    this.value = value;
  }

  static isValid(value: string): boolean {
    return codePattern.test(value);
  }

  static generate(): PasswordResetCode {
    const [random] = crypto.getRandomValues(new Uint32Array(1));
    return new PasswordResetCode((random % 1_000_000).toString().padStart(PasswordResetCode.length, '0'));
  }

  matches(code: string): boolean {
    return this.value === code.trim();
  }
}
