import { BaseResource } from '../../shared/infrastructure/base-response';

/** User profile, as `GET /users/{userId}/profile` returns it (TS-04). */
export interface ProfileResource extends BaseResource {
  /** Identifier of the account that owns the profile. */
  userId: string;
  /** Profile owner's first name. */
  firstName: string;
  /** Profile owner's last name. */
  lastName: string;
  /** Profile owner's sign-in email address. */
  email: string;
  /** Optional contact phone number. */
  phoneNumber: string | null;
  /** Optional profile photo URL. */
  photoUrl: string | null;
}

/**
 * Sign-in email of an account in the local JSON API. Only needed to keep it equal to the profile
 * email, which the REST API does on its own.
 */
export interface AccountEmailResource extends BaseResource {
  /** Sign-in email address associated with the account. */
  email: string;
}
