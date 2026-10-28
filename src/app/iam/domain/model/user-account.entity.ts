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

  constructor(userAccount: { id: string; email: string; role: Role; status: UserStatus }) {
    this._id = userAccount.id;
    this._email = userAccount.email;
    this._role = userAccount.role;
    this._status = userAccount.status;
  }

  get id(): string {
    return this._id;
  }

  get email(): string {
    return this._email;
  }

  get role(): Role {
    return this._role;
  }

  get status(): UserStatus {
    return this._status;
  }

  isActive(): boolean {
    return this._status === UserStatus.Active;
  }

  isGalleryAdministrator(): boolean {
    return this._role === Role.GalleryAdministrator;
  }

  /** The web application is the consolidated view of the gallery administrator (US-05). */
  canAccessWebApplication(): boolean {
    return this.isActive() && this.isGalleryAdministrator();
  }
}
