import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { PasswordRecovery } from '../domain/model/password-recovery.entity';
import { PasswordResetCode } from '../domain/model/password-reset-code.value-object';
import {
  PasswordRecoveriesResponse,
  PasswordRecoveryRequest,
  PasswordRecoveryResource,
} from './password-recoveries-response';

export class PasswordRecoveryAssembler
  implements BaseAssembler<PasswordRecovery, PasswordRecoveryResource, PasswordRecoveriesResponse>
{
  toEntityFromResource(resource: PasswordRecoveryResource): PasswordRecovery {
    return new PasswordRecovery({
      id: resource.id,
      userId: resource.userId,
      code: new PasswordResetCode(resource.code),
      requestedAt: new Date(resource.requestedAt),
      expiresAt: new Date(resource.expiresAt),
      used: resource.used,
    });
  }

  toResourceFromEntity(entity: PasswordRecovery): PasswordRecoveryResource {
    return { id: entity.id, ...this.toRequestFromEntity(entity) };
  }

  toRequestFromEntity(entity: PasswordRecovery): PasswordRecoveryRequest {
    return {
      userId: entity.userId,
      code: entity.code.value,
      requestedAt: entity.requestedAt.toISOString(),
      expiresAt: entity.expiresAt.toISOString(),
      used: entity.used,
    };
  }

  toEntitiesFromResponse(response: PasswordRecoveriesResponse): PasswordRecovery[] {
    return response.passwordRecoveries.map((resource) => this.toEntityFromResource(resource));
  }
}
