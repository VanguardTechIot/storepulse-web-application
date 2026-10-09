import { BaseEntity } from '../../../shared/domain/model/base-entity';
import { PropertyError, PropertyErrorCode } from './property-error';
import { RegisterCommercialUnitCommand } from './register-commercial-unit.command';
import { UnitDimensions } from './unit-dimensions.value-object';
import { UnitStatus } from './unit-status.enum';
import { UnitType } from './unit-type.enum';
import { UpdateCommercialUnitCommand } from './update-commercial-unit.command';

interface CommercialUnitProps {
  id: string;
  galleryId: string;
  type: UnitType;
  code: string;
  floor: string;
  areaSquareMeters: number;
  businessName: string | null;
  status: UnitStatus;
  /** `false` after a logical removal (US-11, TS-09): kept for traceability, no longer managed. */
  active: boolean;
  createdAt: Date;
}

interface UnitData {
  code: string;
  floor: string;
  areaSquareMeters: number;
  businessName: string | null;
}

/**
 * Space inside a gallery (Aggregate Root): a store rented to a tenant or a common area such as a
 * corridor (US-09 to US-11, US-57). The unit number, or the name of a common area, is unique among
 * the active units of the gallery.
 *
 * Changes return a new unit, so a rejected change never alters the current one.
 */
export class CommercialUnit implements BaseEntity {
  static readonly storeCodeMaxLength = 10;
  static readonly commonAreaNameMaxLength = 60;
  static readonly floorMaxLength = 10;
  static readonly businessNameMaxLength = 80;

  private readonly props: CommercialUnitProps;

  constructor(unit: CommercialUnitProps) {
    this.props = { ...unit };
  }

  /**
   * Builds a new unit of the gallery; it gets its id when the repository saves it.
   * `galleryUnits` are the units already registered, to reject a duplicated number or name.
   */
  static register(
    galleryId: string,
    command: RegisterCommercialUnitCommand,
    galleryUnits: readonly CommercialUnit[],
    now: Date = new Date(),
  ): CommercialUnit {
    const data = CommercialUnit.validate(command.type, command);
    CommercialUnit.ensureUniqueCode(command.type, data.code, galleryUnits, null);
    return new CommercialUnit({
      id: '',
      galleryId,
      type: command.type,
      ...data,
      status: UnitStatus.Available,
      active: true,
      createdAt: now,
    });
  }

  get id(): string {
    return this.props.id;
  }

  get galleryId(): string {
    return this.props.galleryId;
  }

  get type(): UnitType {
    return this.props.type;
  }

  get code(): string {
    return this.props.code;
  }

  get floor(): string {
    return this.props.floor;
  }

  get areaSquareMeters(): number {
    return this.props.areaSquareMeters;
  }

  get businessName(): string | null {
    return this.props.businessName;
  }

  get status(): UnitStatus {
    return this.props.status;
  }

  get active(): boolean {
    return this.props.active;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get isStore(): boolean {
    return this.props.type === UnitType.Store;
  }

  get isCommonArea(): boolean {
    return this.props.type === UnitType.CommonArea;
  }

  get isAvailable(): boolean {
    return this.props.status === UnitStatus.Available;
  }

  get isOccupied(): boolean {
    return this.props.status === UnitStatus.Occupied;
  }

  get isUnderMaintenance(): boolean {
    return this.props.status === UnitStatus.Maintenance;
  }

  /** A store without tenant can receive an invitation or an assignment (US-12). */
  canReceiveTenant(): boolean {
    return this.props.active && this.isStore && this.isAvailable;
  }

  update(
    command: UpdateCommercialUnitCommand,
    galleryUnits: readonly CommercialUnit[],
  ): CommercialUnit {
    const data = CommercialUnit.validate(this.props.type, command);
    CommercialUnit.ensureUniqueCode(this.props.type, data.code, galleryUnits, this.props.id);
    return new CommercialUnit({ ...this.props, ...data });
  }

  /** The unit becomes occupied once a tenant is assigned to it (AssignTenantToUnitCommand). */
  assignTenant(): CommercialUnit {
    if (this.isCommonArea) throw new PropertyError(PropertyErrorCode.CommonAreaWithoutTenant);
    if (!this.canReceiveTenant()) throw new PropertyError(PropertyErrorCode.UnitNotAvailable);
    return this.withStatus(UnitStatus.Occupied);
  }

  /** Frees the unit when its tenant leaves (VacateCommercialUnitCommand). */
  vacate(): CommercialUnit {
    return this.isOccupied ? this.withStatus(UnitStatus.Available) : this;
  }

  /** Disables a free unit for maintenance or remodeling (MarkUnitUnderMaintenanceCommand). */
  markUnderMaintenance(): CommercialUnit {
    if (this.isOccupied) throw new PropertyError(PropertyErrorCode.UnitOccupied);
    return this.withStatus(UnitStatus.Maintenance);
  }

  endMaintenance(): CommercialUnit {
    return this.isUnderMaintenance ? this.withStatus(UnitStatus.Available) : this;
  }

  /**
   * Logical removal (US-11, TS-09). It is refused while IoT devices are linked to the unit or a
   * tenant still occupies it.
   */
  remove(linkedDevices: readonly string[]): CommercialUnit {
    if (linkedDevices.length > 0) {
      throw new PropertyError(PropertyErrorCode.UnitHasDevices, {
        count: linkedDevices.length,
        devices: linkedDevices.join(', '),
      });
    }
    if (this.isOccupied) throw new PropertyError(PropertyErrorCode.UnitOccupied);
    return new CommercialUnit({ ...this.props, active: false });
  }

  static isValidCode(type: UnitType, code: string): boolean {
    const trimmed = code.trim();
    const maxLength =
      type === UnitType.Store
        ? CommercialUnit.storeCodeMaxLength
        : CommercialUnit.commonAreaNameMaxLength;
    return trimmed.length > 0 && trimmed.length <= maxLength;
  }

  static isValidFloor(floor: string): boolean {
    const trimmed = floor.trim();
    return trimmed.length > 0 && trimmed.length <= CommercialUnit.floorMaxLength;
  }

  /** Unit numbers and common area names are compared ignoring case and surrounding spaces. */
  static sameCode(a: string, b: string): boolean {
    return a.trim().toLocaleLowerCase() === b.trim().toLocaleLowerCase();
  }

  private withStatus(status: UnitStatus): CommercialUnit {
    return new CommercialUnit({ ...this.props, status });
  }

  private static validate(type: UnitType, data: UnitData): UnitData {
    if (!CommercialUnit.isValidCode(type, data.code)) {
      throw new PropertyError(PropertyErrorCode.InvalidUnitCode);
    }
    if (!CommercialUnit.isValidFloor(data.floor)) {
      throw new PropertyError(PropertyErrorCode.InvalidFloor);
    }
    if (!UnitDimensions.isValid(data.areaSquareMeters)) {
      throw new PropertyError(PropertyErrorCode.InvalidArea);
    }
    const businessName = data.businessName?.trim() || null;
    if (businessName && businessName.length > CommercialUnit.businessNameMaxLength) {
      throw new PropertyError(PropertyErrorCode.InvalidBusinessName);
    }
    const code = data.code.trim();
    return {
      // Store numbers are shown in capitals (A-03); common area names keep their spelling.
      code: type === UnitType.Store ? code.toUpperCase() : code,
      floor: data.floor.trim(),
      areaSquareMeters: new UnitDimensions(data.areaSquareMeters).areaSquareMeters,
      // A common area has no tenant, so it has no business either.
      businessName: type === UnitType.Store ? businessName : null,
    };
  }

  private static ensureUniqueCode(
    type: UnitType,
    code: string,
    galleryUnits: readonly CommercialUnit[],
    ownId: string | null,
  ): void {
    const taken = galleryUnits.some(
      (unit) => unit.active && unit.id !== ownId && CommercialUnit.sameCode(unit.code, code),
    );
    if (taken) {
      throw new PropertyError(
        type === UnitType.Store
          ? PropertyErrorCode.DuplicatedUnitCode
          : PropertyErrorCode.DuplicatedCommonAreaName,
      );
    }
  }
}
