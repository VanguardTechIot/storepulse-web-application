import { BaseEntity } from '../../../shared/domain/model/base-entity';
import { Role } from './role.enum';
import { UserStatus } from './user-status.enum';

/**
 * Access account of a StorePulse user (Aggregate Root).
 * Profile data such as name or photo belongs to Profiles and Preferences, not to this context.
 */
export class UserAccount implements BaseEntity {
  private readonly _id: string;
  private readonly _email: string;
  private readonly _role: Role;
  private readonly _status: UserStatus;

  /**
   * Creates a user account entity.
   *
   * @param userAccount - Account identifier, email address, role, and status.
   */
  constructor(userAccount: { id: string; email: string; role: Role; status: UserStatus }) {
    this._id = userAccount.id;
    this._email = userAccount.email;
    this._role = userAccount.role;
    this._status = userAccount.status;
  }

  /** Gets the account identifier. */
  get id(): string {
    return this._id;
  }

  /** Gets the account email address. */
  get email(): string {
    return this._email;
  }

  /** Gets the account role. */
  get role(): Role {
    return this._role;
  }

  /** Gets the account status. */
  get status(): UserStatus {
    return this._status;
  }

  /**
   * Determines whether the account is active.
   *
   * @returns `true` if the account status is active; otherwise, `false`.
   */
  isActive(): boolean {
    return this._status === UserStatus.Active;
  }

  /**
   * Determines whether the account belongs to a gallery administrator.
   *
   * @returns `true` if the account role is gallery administrator; otherwise, `false`.
   */
  isGalleryAdministrator(): boolean {
    return this._role === Role.GalleryAdministrator;
  }

  /**
   * Determines whether the account can access the web application, the consolidated view
   * of the gallery administrator (US-05).
   *
   * @returns `true` if the account is active and belongs to a gallery administrator;
   * otherwise, `false`.
   */
  canAccessWebApplication(): boolean {
    return this.isActive() && this.isGalleryAdministrator();
  }
}
