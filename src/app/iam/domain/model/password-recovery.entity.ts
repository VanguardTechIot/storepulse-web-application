import { BaseEntity } from '../../../shared/domain/model/base-entity';
import { PasswordResetCode } from './password-reset-code.value-object';

/**
 * Password recovery process of a user (Aggregate Root): a 6-digit code that is valid for
 * 15 minutes and can be used only once (US-03).
 */
export class PasswordRecovery implements BaseEntity {
  /** Number of minutes for which a recovery code remains valid. */
  static readonly validityInMinutes = 15;

  private readonly _id: string;
  private readonly _userId: string;
  private readonly _code: PasswordResetCode;
  private readonly _requestedAt: Date;
  private readonly _expiresAt: Date;
  private readonly _used: boolean;

  /**
   * Creates a password recovery entity from its persisted or newly generated values.
   *
   * @param passwordRecovery - Recovery identifier, user, code, timestamps, and usage state.
   */
  constructor(passwordRecovery: {
    id: string;
    userId: string;
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
  static generate(userId: string, now: Date = new Date()): PasswordRecovery {
    return new PasswordRecovery({
      id: '',
      userId,
      code: PasswordResetCode.generate(),
      requestedAt: now,
      expiresAt: new Date(now.getTime() + PasswordRecovery.validityInMinutes * 60_000),
      used: false,
    });
  }

  /** Gets the recovery identifier. */
  get id(): string {
    return this._id;
  }

  /** Gets the identifier of the user requesting recovery. */
  get userId(): string {
    return this._userId;
  }

  /** Gets the password reset code. */
  get code(): PasswordResetCode {
    return this._code;
  }

  /** Gets the time at which recovery was requested. */
  get requestedAt(): Date {
    return this._requestedAt;
  }

  /** Gets the time at which the recovery code expires. */
  get expiresAt(): Date {
    return this._expiresAt;
  }

  /** Indicates whether the recovery code has already been used. */
  get used(): boolean {
    return this._used;
  }

  /**
   * Determines whether the recovery code has expired.
   *
   * @param now - Time to compare against the expiration time; defaults to the current time.
   * @returns `true` if the recovery code has expired; otherwise, `false`.
   */
  isExpired(now: Date = new Date()): boolean {
    return now.getTime() >= this._expiresAt.getTime();
  }

  /**
   * Checks whether a code matches this recovery and has not already been used.
   *
   * @param code - Code to validate.
   * @returns `true` if the code matches and has not been used; otherwise, `false`.
   */
  validate(code: string): boolean {
    return !this._used && this._code.matches(code);
  }
}
