import { PasswordRecovery } from './password-recovery.entity';
import { PasswordResetCode } from './password-reset-code.value-object';

describe('PasswordRecovery', () => {
  const requestedAt = new Date('2026-10-08T10:00:00Z');

  function recovery(overrides: Partial<{ used: boolean }> = {}): PasswordRecovery {
    return new PasswordRecovery({
      id: 'rec-001',
      userId: 'usr-007',
      code: new PasswordResetCode('482917'),
      requestedAt,
      expiresAt: new Date(requestedAt.getTime() + 15 * 60_000),
      used: overrides.used ?? false,
    });
  }

  it('generates a 6-digit code valid for 15 minutes', () => {
    const generated = PasswordRecovery.generate('usr-007', requestedAt);
    expect(PasswordResetCode.isValid(generated.code.value)).toBe(true);
    expect(generated.expiresAt.getTime() - requestedAt.getTime()).toBe(15 * 60_000);
    expect(generated.used).toBe(false);
  });

  it('accepts the matching code only once', () => {
    expect(recovery().validate('482917')).toBe(true);
    expect(recovery({ used: true }).validate('482917')).toBe(false);
  });

  it('rejects a code that does not match', () => {
    expect(recovery().validate('111111')).toBe(false);
  });

  it('expires 15 minutes after it was requested', () => {
    expect(recovery().isExpired(new Date('2026-10-08T10:14:59Z'))).toBe(false);
    expect(recovery().isExpired(new Date('2026-10-08T10:15:00Z'))).toBe(true);
  });
});
