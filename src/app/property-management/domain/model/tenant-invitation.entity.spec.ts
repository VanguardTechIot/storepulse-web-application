import { CommercialUnit } from './commercial-unit.entity';
import { InvitationStatus } from './invitation-status.enum';
import { PropertyError, PropertyErrorCode } from './property-error';
import { TenantInvitation } from './tenant-invitation.entity';
import { UnitStatus } from './unit-status.enum';
import { UnitType } from './unit-type.enum';

describe('TenantInvitation', () => {
  const now = new Date('2026-10-08T15:00:00Z');

  function unit(status = UnitStatus.Available, type = UnitType.Store): CommercialUnit {
    return new CommercialUnit({
      id: 'unit-a10',
      galleryId: 'gal-001',
      type,
      code: 'A-10',
      floor: '1',
      areaSquareMeters: 20,
      businessName: null,
      status,
      active: true,
      createdAt: now,
    });
  }

  function errorOf(change: () => unknown): PropertyErrorCode | null {
    try {
      change();
      return null;
    } catch (error) {
      return error instanceof PropertyError ? error.code : null;
    }
  }

  it('sends a link to a store without tenant, valid for 7 days (US-12, scenario 1)', () => {
    const invitation = TenantInvitation.issue(unit(), ' Carlos.Rojas@Gmail.com ', now);

    expect(invitation.email).toBe('carlos.rojas@gmail.com');
    expect(invitation.token).toMatch(/^[0-9a-f]{16}$/);
    expect(invitation.expiresAt.toISOString()).toBe('2026-10-15T15:00:00.000Z');
    expect(invitation.statusAt(now)).toBe(InvitationStatus.Pending);
  });

  it('expires when 7 days pass and can be sent again (US-12, scenario 3)', () => {
    const invitation = TenantInvitation.issue(unit(), 'carlos.rojas@gmail.com', now);

    expect(invitation.statusAt(new Date('2026-10-15T15:00:00Z'))).toBe(InvitationStatus.Expired);
    expect(invitation.canBeResent()).toBe(true);
    expect(invitation.revoke().statusAt(now)).toBe(InvitationStatus.Revoked);
    expect(errorOf(() => invitation.revoke().revoke())).toBe(
      PropertyErrorCode.InvitationNotPending,
    );
  });

  it('is refused for occupied stores, common areas and invalid emails', () => {
    expect(errorOf(() => TenantInvitation.issue(unit(UnitStatus.Occupied), 'a@b.pe', now))).toBe(
      PropertyErrorCode.UnitNotAvailable,
    );
    expect(
      errorOf(() =>
        TenantInvitation.issue(unit(UnitStatus.Available, UnitType.CommonArea), 'a@b.pe', now),
      ),
    ).toBe(PropertyErrorCode.CommonAreaWithoutTenant);
    expect(errorOf(() => TenantInvitation.issue(unit(), 'carlos.rojas', now))).toBe(
      PropertyErrorCode.InvalidEmail,
    );
  });
});
