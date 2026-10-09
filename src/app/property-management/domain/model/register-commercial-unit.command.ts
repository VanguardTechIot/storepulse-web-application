import { UnitType } from './unit-type.enum';

/** Registers a store (US-09, TS-07) or a common area (US-57) in the gallery. */
export class RegisterCommercialUnitCommand {
  readonly type: UnitType;
  /** Unit number of a store (`A-03`) or name of a common area (`Pasillo norte`). */
  readonly code: string;
  readonly floor: string;
  readonly areaSquareMeters: number;
  /** Trade name of the business that operates the store. Optional. */
  readonly businessName: string | null;

  constructor(command: {
    type: UnitType;
    code: string;
    floor: string;
    areaSquareMeters: number;
    businessName: string | null;
  }) {
    this.type = command.type;
    this.code = command.code;
    this.floor = command.floor;
    this.areaSquareMeters = command.areaSquareMeters;
    this.businessName = command.businessName;
  }
}
