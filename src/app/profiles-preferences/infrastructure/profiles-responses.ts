/** User profile, as `GET /users/{userId}/profile` returns it. */
export interface ProfileResource {
  id: number;
  /** Identifier of the account that owns the profile. */
  userId: number;
  firstName: string;
  lastName: string;
  /** Profile owner's sign-in email address. */
  email: string;
  phoneNumber: string | null;
  photoUrl: string | null;
}

/** Request body of `PUT /users/{userId}/profile`. */
export type UpdateProfileResource = Omit<ProfileResource, 'id' | 'userId'>;
