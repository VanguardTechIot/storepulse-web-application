import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { PasswordRecovery } from '../domain/model/password-recovery.entity';
import { PasswordResetCode } from '../domain/model/password-reset-code.value-object';
import { Role } from '../domain/model/role.enum';
import { UserAccount } from '../domain/model/user-account.entity';
import { UserStatus } from '../domain/model/user-status.enum';
import {
  PasswordRecoveryRequest,
  PasswordRecoveryResource,
  UserAccountResource,
} from './identity-access-responses';

/**
 * Converts between user account domain entities and API resources.
 */
export class UserAccountAssembler implements BaseAssembler<UserAccount, UserAccountResource> {
  /**
   * Creates a user account entity from an API resource.
   *
   * @param r - User account resource.
   * @returns The corresponding user account entity.
   */
  toEntityFromResource(r: UserAccountResource): UserAccount {
    return new UserAccount({
      id: r.id,
      email: r.email,
      role: r.role as Role,
      status: r.status as UserStatus,
    });
  }

  /**
   * Creates an API resource from a user account entity.
   *
   * @param e - User account entity.
   * @returns The corresponding user account resource.
   */
  toResourceFromEntity(e: UserAccount): UserAccountResource {
    return { id: e.id, email: e.email, role: e.role, status: e.status };
  }
}

/**
 * Converts between password recovery domain entities and API resources.
 */
export class PasswordRecoveryAssembler
  implements BaseAssembler<PasswordRecovery, PasswordRecoveryResource>
{
  /**
   * Creates a password recovery entity from an API resource.
   *
   * @param r - Password recovery resource.
   * @returns The corresponding password recovery entity.
   */
  toEntityFromResource(r: PasswordRecoveryResource): PasswordRecovery {
    return new PasswordRecovery({
      id: r.id,
      userId: r.userId,
      code: new PasswordResetCode(r.code),
      requestedAt: new Date(r.requestedAt),
      expiresAt: new Date(r.expiresAt),
      used: r.used,
    });
  }

  /**
   * Creates an API resource from a password recovery entity.
   *
   * @param e - Password recovery entity.
   * @returns The corresponding password recovery resource.
   */
  toResourceFromEntity(e: PasswordRecovery): PasswordRecoveryResource {
    return { id: e.id, ...this.toRequestFromEntity(e) };
  }

  /**
   * Creates a request body to create a recovery; the API assigns its identifier.
   *
   * @param e - Password recovery entity.
   * @returns The request body for creating the recovery.
   */
  toRequestFromEntity(e: PasswordRecovery): PasswordRecoveryRequest {
    return {
      userId: e.userId,
      code: e.code.value,
      requestedAt: e.requestedAt.toISOString(),
      expiresAt: e.expiresAt.toISOString(),
      used: e.used,
    };
  }
}
