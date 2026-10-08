import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { Role } from '../domain/model/role.enum';
import { UserAccount } from '../domain/model/user-account.entity';
import { UserStatus } from '../domain/model/user-status.enum';
import { UserAccountResource, UsersResponse } from './users-response';

export class UserAccountAssembler
  implements BaseAssembler<UserAccount, UserAccountResource, UsersResponse>
{
  toEntityFromResource(resource: UserAccountResource): UserAccount {
    return new UserAccount({
      id: resource.id,
      email: resource.email,
      role: resource.role as Role,
      status: resource.status as UserStatus,
    });
  }

  toResourceFromEntity(entity: UserAccount): UserAccountResource {
    return {
      id: entity.id,
      email: entity.email,
      role: entity.role,
      status: entity.status,
    };
  }

  toEntitiesFromResponse(response: UsersResponse): UserAccount[] {
    return response.users.map((resource) => this.toEntityFromResource(resource));
  }
}
