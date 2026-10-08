import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

export interface PasswordRecoveryResource extends BaseResource {
  id: number;
  userId: number;
  code: string;
  requestedAt: string;
  expiresAt: string;
  used: boolean;
}

export type PasswordRecoveryRequest = Omit<PasswordRecoveryResource, 'id'>;

export interface PasswordRecoveriesResponse extends BaseResponse {
  passwordRecoveries: PasswordRecoveryResource[];
}
