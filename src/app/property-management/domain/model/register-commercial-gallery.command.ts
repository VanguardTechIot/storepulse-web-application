/** Registers the gallery of the signed-in administrator (US-08, TS-05). */
export class RegisterCommercialGalleryCommand {
  readonly name: string;
  readonly address: string;
  /** Number of units the gallery has, as declared by the administrator. */
  readonly totalUnits: number;

  constructor(command: { name: string; address: string; totalUnits: number }) {
    this.name = command.name;
    this.address = command.address;
    this.totalUnits = command.totalUnits;
  }
}
