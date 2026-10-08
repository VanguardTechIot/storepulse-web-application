import { BaseEntity } from '../../../shared/domain/model/base-entity';
import { PasswordResetCode } from './password-reset-code.value-object';

/**
 * Password recovery process of a user (Aggregate Root): a 6-digit code that is valid for
 * 15 minutes and can be used only once (US-03).
 */
export class PasswordRecovery implements BaseEntity {
  static readonly validityInMinutes = 15;

  private readonly _id: number;
  private readonly _userId: number;
  private readonly _code: PasswordResetCode;
  private readonly _requestedAt: Date;
  private readonly _expiresAt: Date;
  private readonly _used: boolean;

  constructor(passwordRecovery: {
    id: number;
    userId: number;
    code: PasswordResetCode;
    requestedAt: Date;
    expiresAt: Date;
    used: boolean;
  }) {
    this._id = passwordRecovery.id;
    this._userId = passwordRecovery.userId;
    this._code = passwordRecovery.code;
    this._requestedAt = passwordRecovery.requestedAt;
    this._expiresAt = passwordRecovery.expiresAt;
    this._used = passwordRecovery.used;
  }

  /** Starts a new recovery for a user with a freshly generated code. */
  static generate(userId: number, now: Date = new Date()): PasswordRecovery {
    return new PasswordRecovery({
      id: 0,
      userId,
      code: PasswordResetCode.generate(),
      requestedAt: now,
      expiresAt: new Date(now.getTime() + PasswordRecovery.validityInMinutes * 60_000),
      used: false,
    });
  }

  get id(): number {
    return this._id;
  }

  get userId(): number {
    return this._userId;
  }

  get code(): PasswordResetCode {
    return this._code;
  }

  get requestedAt(): Date {
    return this._requestedAt;
  }

  get expiresAt(): Date {
    return this._expiresAt;
  }

  get used(): boolean {
    return this._used;
  }

  isExpired(now: Date = new Date()): boolean {
    return now.getTime() >= this._expiresAt.getTime();
  }

  /** A code is accepted only once and only if it matches the generated one. */
  validate(code: string): boolean {
    return !this._used && this._code.matches(code);
  }
}
