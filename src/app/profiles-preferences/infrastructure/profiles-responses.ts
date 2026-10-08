import { BaseResource } from '../../shared/infrastructure/base-response';

/** User profile, as `GET /users/{userId}/profile` returns it (TS-04). */
export interface ProfileResource extends BaseResource {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  photoUrl: string | null;
}

/**
 * Sign-in email of an account in the local JSON API. Only needed to keep it equal to the profile
 * email, which the REST API does on its own.
 */
export interface AccountEmailResource extends BaseResource {
  email: string;
}
