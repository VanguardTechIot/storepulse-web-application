export interface PasswordPolicyEvaluation {
  hasMinimumLength: boolean;
  hasNumber: boolean;
}

/**
 * Minimum password complexity required to register or change a password (US-01, US-03):
 * at least 8 characters and at least one number.
 */
export class PasswordPolicy {
  static readonly minimumLength = 8;

  static evaluate(password: string): PasswordPolicyEvaluation {
    return {
      hasMinimumLength: password.length >= PasswordPolicy.minimumLength,
      hasNumber: /\d/.test(password),
    };
  }

  static isSatisfiedBy(password: string): boolean {
    const evaluation = PasswordPolicy.evaluate(password);
    return evaluation.hasMinimumLength && evaluation.hasNumber;
  }
}
