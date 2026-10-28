import { BaseResource } from '../../shared/infrastructure/base-response';

/** Public representation of a user account exposed by the REST API. */
export interface UserAccountResource extends BaseResource {
  /** Account email address. */
  email: string;
  /** Account role. */
  role: string;
  /** Account status. */
  status: string;
}

/**
 * User record stored by the local JSON API. It also keeps the password hash because json-server
 * has no server-side logic; the real REST API never returns it.
 */
export interface UserResource extends UserAccountResource {
  /** Hashed password used by the local JSON API. */
  passwordHash: string;
}

/** Request body for registering a user; the API assigns the identifier. */
export type SignUpRequest = Omit<UserResource, 'id'>;

/**
 * Profile created together with the account. Only the local JSON API needs it: the REST API
 * creates it in Profiles and Preferences on its own. Its id is the user id, so
 * `/users/{userId}/profile` maps onto it.
 */
export interface ProfileCreationRequest extends BaseResource {
  /** Identifier of the user associated with this profile. */
  userId: string;
  /** User's first name. */
  firstName: string;
  /** User's last name. */
  lastName: string;
  /** User's email address. */
  email: string;
  /** User's phone number, if provided. */
  phoneNumber: string | null;
  /** URL of the user's profile photo, if available. */
  photoUrl: string | null;
}

/** Password recovery data returned by the API. */
export interface PasswordRecoveryResource extends BaseResource {
  /** Identifier of the user requesting recovery. */
  userId: string;
  /** Six-digit password reset code. */
  code: string;
  /** ISO 8601 timestamp when recovery was requested. */
  requestedAt: string;
  /** ISO 8601 timestamp when the reset code expires. */
  expiresAt: string;
  /** Whether the reset code has been used. */
  used: boolean;
}

/** Request body for creating password recovery data; the API assigns the identifier. */
export type PasswordRecoveryRequest = Omit<PasswordRecoveryResource, 'id'>;
