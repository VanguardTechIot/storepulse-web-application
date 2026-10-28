import { BaseResource } from '../../shared/infrastructure/base-response';

/** Public view of a user account, as the REST API exposes it. */
export interface UserAccountResource extends BaseResource {
  email: string;
  role: string;
  status: string;
}

/**
 * User record stored by the local JSON API. It also keeps the password hash because json-server
 * has no server-side logic; the real REST API never returns it.
 */
export interface UserResource extends UserAccountResource {
  passwordHash: string;
}

export type SignUpRequest = Omit<UserResource, 'id'>;

/**
 * Profile created together with the account. Only the local JSON API needs it: the REST API
 * creates it in Profiles and Preferences on its own. Its id is the user id, so
 * `/users/{userId}/profile` maps onto it.
 */
export interface ProfileCreationRequest extends BaseResource {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  photoUrl: string | null;
}

export interface PasswordRecoveryResource extends BaseResource {
  userId: string;
  code: string;
  requestedAt: string;
  expiresAt: string;
  used: boolean;
}

export type PasswordRecoveryRequest = Omit<PasswordRecoveryResource, 'id'>;
