import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

/**
 * Public view of a user account, as the REST API exposes it.
 */
export interface UserAccountResource extends BaseResource {
  id: number;
  email: string;
  role: string;
  status: string;
}

/**
 * User record stored by the local JSON API. It also keeps the registration name and the password
 * hash because json-server has no server-side logic; the real REST API never returns them.
 */
export interface UserResource extends UserAccountResource {
  fullName: string;
  passwordHash: string;
}

export interface UsersResponse extends BaseResponse {
  users: UserAccountResource[];
}
