/**
 * Edits the personal and contact data of the profile (US-07). The email is also the sign-in
 * email, so changing it changes how the user logs in.
 */
export class UpdateProfileCommand {
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  /** Optional: empty or `null` removes it. */
  readonly phoneNumber: string | null;

  constructor(command: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string | null;
  }) {
    this.firstName = command.firstName;
    this.lastName = command.lastName;
    this.email = command.email;
    this.phoneNumber = command.phoneNumber;
  }
}
