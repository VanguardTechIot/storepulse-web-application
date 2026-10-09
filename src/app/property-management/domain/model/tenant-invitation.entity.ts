import { BaseEntity } from '../../../shared/domain/model/base-entity';
import { CommercialUnit } from './commercial-unit.entity';
import { InvitationStatus } from './invitation-status.enum';
import { PropertyError, PropertyErrorCode } from './property-error';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const dayInMs = 24 * 60 * 60 * 1000;

interface TenantInvitationProps {
  id: string;
  unitId: string;
  galleryId: string;
  email: string;
  /** Goes inside the sign-up link; the tenant registers with it (US-12, scenario 2). */
  token: string;
  status: InvitationStatus;
  sentAt: Date;
  expiresAt: Date;
}

/**
 * Invitation for a tenant to sign up linked to one store (US-12, TS-10). It is valid for 7 days;
 * sending it again revokes the previous link and issues a new one (US-12, scenario 3).
 */
export class TenantInvitation implements BaseEntity {
  static readonly validityDays = 7;

  private readonly props: TenantInvitationProps;

  constructor(invitation: TenantInvitationProps) {
    this.props = { ...invitation };
  }

  /** Issues an invitation for a store without tenant; it gets its id when saved. */
  static issue(unit: CommercialUnit, email: string, now: Date = new Date()): TenantInvitation {
    if (unit.isCommonArea) throw new PropertyError(PropertyErrorCode.CommonAreaWithoutTenant);
    if (!unit.canReceiveTenant()) throw new PropertyError(PropertyErrorCode.UnitNotAvailable);
    if (!TenantInvitation.isValidEmail(email)) {
      throw new PropertyError(PropertyErrorCode.InvalidEmail);
    }
    return new TenantInvitation({
      id: '',
      unitId: unit.id,
      galleryId: unit.galleryId,
      email: TenantInvitation.normalizeEmail(email),
      token: TenantInvitation.newToken(),
      status: InvitationStatus.Pending,
      sentAt: now,
      expiresAt: new Date(now.getTime() + TenantInvitation.validityDays * dayInMs),
    });
  }

  get id(): string {
    return this.props.id;
  }

  get unitId(): string {
    return this.props.unitId;
  }

  get galleryId(): string {
    return this.props.galleryId;
  }

  get email(): string {
    return this.props.email;
  }

  get token(): string {
    return this.props.token;
  }

  get sentAt(): Date {
    return this.props.sentAt;
  }

  get expiresAt(): Date {
    return this.props.expiresAt;
  }

  /** Status as stored; `statusAt` tells whether a pending invitation already expired. */
  get storedStatus(): InvitationStatus {
    return this.props.status;
  }

  statusAt(now: Date = new Date()): InvitationStatus {
    if (this.props.status === InvitationStatus.Pending && now >= this.props.expiresAt) {
      return InvitationStatus.Expired;
    }
    return this.props.status;
  }

  /** Pending invitations, expired or not, can be sent again; accepted or revoked ones cannot. */
  canBeResent(): boolean {
    return this.props.status === InvitationStatus.Pending;
  }

  /** Invalidates the link, for example because a new one was sent. */
  revoke(): TenantInvitation {
    if (this.props.status !== InvitationStatus.Pending) {
      throw new PropertyError(PropertyErrorCode.InvitationNotPending);
    }
    return new TenantInvitation({ ...this.props, status: InvitationStatus.Revoked });
  }

  static isValidEmail(email: string): boolean {
    return emailPattern.test(TenantInvitation.normalizeEmail(email));
  }

  static normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private static newToken(): string {
    const bytes = new Uint8Array(8);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  }
}
