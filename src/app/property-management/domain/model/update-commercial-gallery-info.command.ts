/** Edits the general data of a registered gallery. */
export class UpdateCommercialGalleryInfoCommand {
  readonly name: string;
  readonly address: string;
  readonly totalUnits: number;

  constructor(command: { name: string; address: string; totalUnits: number }) {
    this.name = command.name;
    this.address = command.address;
    this.totalUnits = command.totalUnits;
  }
}
