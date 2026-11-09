/** Public representation of a user account exposed by the REST API. */
export interface UserAccountResource {
  id: number;
  email: string;
  role: string;
  status: string;
}

/** Answer of sign-in and sign-up: the account and the JWT that authorizes its requests. */
export interface AuthenticatedUserResource {
  user: UserAccountResource;
  accessToken: string;
}

/** Request body for signing in. */
export interface SignInResource {
  email: string;
  password: string;
}

/** Request body for registering an account; the REST API also creates its profile. */
export interface SignUpResource {
  fullName: string;
  email: string;
  password: string;
  role: string;
}

/** Request body for asking a reset code, which the REST API sends by email. */
export interface RequestPasswordResetResource {
  email: string;
}

/** Answer of a reset request: when the code expires. */
export interface PasswordResetRequestedResource {
  expiresAt: string;
}

/** Request body for setting a new password with the code received. */
export interface ResetPasswordResource {
  email: string;
  code: string;
  newPassword: string;
}
