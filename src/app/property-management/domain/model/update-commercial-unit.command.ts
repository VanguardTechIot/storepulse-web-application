/** Edits the data of a unit (US-10, TS-08). Its type cannot change. */
export class UpdateCommercialUnitCommand {
  readonly code: string;
  readonly floor: string;
  readonly areaSquareMeters: number;
  readonly businessName: string | null;

  constructor(command: {
    code: string;
    floor: string;
    areaSquareMeters: number;
    businessName: string | null;
  }) {
    this.code = command.code;
    this.floor = command.floor;
    this.areaSquareMeters = command.areaSquareMeters;
    this.businessName = command.businessName;
  }
}
