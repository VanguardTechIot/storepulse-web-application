import { Role } from '../domain/model/role.enum';
import { UserAccount } from '../domain/model/user-account.entity';
import { UserSession } from '../domain/model/user-session.value-object';
import { UserStatus } from '../domain/model/user-status.enum';
import { AuthenticatedUserResource, UserAccountResource } from './identity-access-responses';

/**
 * Converts the accounts answered by the REST API into domain entities.
 */
export class UserAccountAssembler {
  toEntityFromResource(r: UserAccountResource): UserAccount {
    return new UserAccount({
      id: String(r.id),
      email: r.email,
      role: r.role as Role,
      status: r.status as UserStatus,
    });
  }

  toSessionFromResource(r: AuthenticatedUserResource): UserSession {
    return new UserSession({
      user: this.toEntityFromResource(r.user),
      accessToken: r.accessToken,
    });
  }
}
