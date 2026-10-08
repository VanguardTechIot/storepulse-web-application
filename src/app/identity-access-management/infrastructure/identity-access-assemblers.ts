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

export class UserAccountAssembler implements BaseAssembler<UserAccount, UserAccountResource> {
  toEntityFromResource(r: UserAccountResource): UserAccount {
    return new UserAccount({
      id: r.id,
      email: r.email,
      role: r.role as Role,
      status: r.status as UserStatus,
    });
  }

  toResourceFromEntity(e: UserAccount): UserAccountResource {
    return { id: e.id, email: e.email, role: e.role, status: e.status };
  }
}

export class PasswordRecoveryAssembler
  implements BaseAssembler<PasswordRecovery, PasswordRecoveryResource>
{
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

  toResourceFromEntity(e: PasswordRecovery): PasswordRecoveryResource {
    return { id: e.id, ...this.toRequestFromEntity(e) };
  }

  /** Body to create a recovery: the API assigns the id. */
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
