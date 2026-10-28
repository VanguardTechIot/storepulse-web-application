/**
 * Results of checking a password against the password policy.
 */
export interface PasswordPolicyEvaluation {
  /** Whether the password meets the minimum length requirement. */
  hasMinimumLength: boolean;

  /** Whether the password contains at least one number. */
  hasNumber: boolean;
}

/**
 * Minimum password complexity required to register or change a password (US-01, US-03):
 * at least 8 characters and at least one number.
 */
export class PasswordPolicy {
  /** Minimum number of characters required in a password. */
  static readonly minimumLength = 8;

  /**
   * Checks a password against each individual policy requirement.
   *
   * @param password - Password to evaluate.
   * @returns The result for each password policy requirement.
   */
  static evaluate(password: string): PasswordPolicyEvaluation {
    return {
      hasMinimumLength: password.length >= PasswordPolicy.minimumLength,
      hasNumber: /\d/.test(password),
    };
  }

  /**
   * Determines whether a password satisfies all policy requirements.
   *
   * @param password - Password to validate.
   * @returns `true` if the password meets the minimum length and contains
   * at least one number; otherwise, `false`.
   */
  static isSatisfiedBy(password: string): boolean {
    const evaluation = PasswordPolicy.evaluate(password);
    return evaluation.hasMinimumLength && evaluation.hasNumber;
  }
}
