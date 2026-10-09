import { BaseEntity } from '../../../shared/domain/model/base-entity';
import { PropertyError, PropertyErrorCode } from './property-error';
import { RegisterCommercialGalleryCommand } from './register-commercial-gallery.command';
import { UpdateCommercialGalleryInfoCommand } from './update-commercial-gallery-info.command';

interface CommercialGalleryProps {
  id: string;
  /** Gallery administrator that owns it (Identity and Access Management user id). */
  administratorId: string;
  name: string;
  address: string;
  totalUnits: number;
  registeredAt: Date;
}

/**
 * Commercial gallery managed in StorePulse (Aggregate Root): its name, address and the number of
 * units it has (US-08, TS-05). Each administrator manages one gallery.
 *
 * Changes return a new gallery, so invalid data never alters the current one.
 */
export class CommercialGallery implements BaseEntity {
  static readonly nameMaxLength = 80;
  static readonly addressMaxLength = 160;
  static readonly maxTotalUnits = 1000;

  private readonly props: CommercialGalleryProps;

  constructor(gallery: CommercialGalleryProps) {
    this.props = { ...gallery };
  }

  /** Builds a new gallery; it gets its id when the repository saves it. */
  static register(
    administratorId: string,
    command: RegisterCommercialGalleryCommand,
    now: Date = new Date(),
  ): CommercialGallery {
    const data = CommercialGallery.validate(command.name, command.address, command.totalUnits);
    return new CommercialGallery({ id: '', administratorId, registeredAt: now, ...data });
  }

  get id(): string {
    return this.props.id;
  }

  get administratorId(): string {
    return this.props.administratorId;
  }

  get name(): string {
    return this.props.name;
  }

  get address(): string {
    return this.props.address;
  }

  get totalUnits(): number {
    return this.props.totalUnits;
  }

  get registeredAt(): Date {
    return this.props.registeredAt;
  }

  updateInfo(command: UpdateCommercialGalleryInfoCommand): CommercialGallery {
    const data = CommercialGallery.validate(command.name, command.address, command.totalUnits);
    return new CommercialGallery({ ...this.props, ...data });
  }

  static isValidName(name: string): boolean {
    const trimmed = name.trim();
    return trimmed.length > 0 && trimmed.length <= CommercialGallery.nameMaxLength;
  }

  static isValidAddress(address: string): boolean {
    const trimmed = address.trim();
    return trimmed.length > 0 && trimmed.length <= CommercialGallery.addressMaxLength;
  }

  static isValidTotalUnits(totalUnits: number): boolean {
    return (
      Number.isInteger(totalUnits) &&
      totalUnits > 0 &&
      totalUnits <= CommercialGallery.maxTotalUnits
    );
  }

  private static validate(name: string, address: string, totalUnits: number) {
    if (!CommercialGallery.isValidName(name)) {
      throw new PropertyError(PropertyErrorCode.InvalidGalleryName);
    }
    if (!CommercialGallery.isValidAddress(address)) {
      throw new PropertyError(PropertyErrorCode.InvalidAddress);
    }
    if (!CommercialGallery.isValidTotalUnits(totalUnits)) {
      throw new PropertyError(PropertyErrorCode.InvalidTotalUnits);
    }
    return { name: name.trim(), address: address.trim(), totalUnits };
  }
}
