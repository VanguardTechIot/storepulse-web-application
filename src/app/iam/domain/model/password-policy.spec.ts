import { PasswordPolicy } from './password-policy';

describe('PasswordPolicy', () => {
  it('accepts a password with at least 8 characters and one number', () => {
    expect(PasswordPolicy.isSatisfiedBy('gallery2026')).toBe(true);
  });

  it('rejects a password shorter than 8 characters', () => {
    expect(PasswordPolicy.evaluate('abc123')).toEqual({ hasMinimumLength: false, hasNumber: true });
    expect(PasswordPolicy.isSatisfiedBy('abc123')).toBe(false);
  });

  it('rejects a password without numbers', () => {
    expect(PasswordPolicy.evaluate('galleryadmin')).toEqual({
      hasMinimumLength: true,
      hasNumber: false,
    });
    expect(PasswordPolicy.isSatisfiedBy('galleryadmin')).toBe(false);
  });
});
