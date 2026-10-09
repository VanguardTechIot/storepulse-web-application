import { CommercialUnit } from './commercial-unit.entity';
import { PropertyError, PropertyErrorCode } from './property-error';
import { RegisterCommercialUnitCommand } from './register-commercial-unit.command';
import { UnitStatus } from './unit-status.enum';
import { UnitType } from './unit-type.enum';
import { UpdateCommercialUnitCommand } from './update-commercial-unit.command';

describe('CommercialUnit', () => {
  function unit(id: string, code: string, type = UnitType.Store, status = UnitStatus.Available) {
    return new CommercialUnit({
      id,
      galleryId: 'gal-001',
      type,
      code,
      floor: '1',
      areaSquareMeters: 20,
      businessName: null,
      status,
      active: true,
      createdAt: new Date('2026-03-02T15:00:00Z'),
    });
  }

  const gallery = [
    unit('unit-a03', 'A-03', UnitType.Store, UnitStatus.Occupied),
    unit('unit-cn01', 'Pasillo norte', UnitType.CommonArea),
  ];

  function command(
    changes: Partial<RegisterCommercialUnitCommand> = {},
  ): RegisterCommercialUnitCommand {
    return new RegisterCommercialUnitCommand({
      type: UnitType.Store,
      code: ' a-10 ',
      floor: '1',
      areaSquareMeters: 20.456,
      businessName: '  ',
      ...changes,
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

  it('registers an available store linked to the gallery (US-09, scenario 1)', () => {
    const store = CommercialUnit.register('gal-001', command(), gallery);

    expect(store.galleryId).toBe('gal-001');
    expect(store.code).toBe('A-10');
    expect(store.areaSquareMeters).toBe(20.46);
    expect(store.businessName).toBeNull();
    expect(store.status).toBe(UnitStatus.Available);
  });

  it('rejects a unit number already used in the gallery (US-09 and US-10, scenario 2)', () => {
    expect(
      errorOf(() => CommercialUnit.register('gal-001', command({ code: 'a-03' }), gallery)),
    ).toBe(PropertyErrorCode.DuplicatedUnitCode);
    const free = unit('unit-a10', 'A-10');
    expect(
      errorOf(() =>
        free.update(
          new UpdateCommercialUnitCommand({
            code: 'A-03',
            floor: '1',
            areaSquareMeters: 20,
            businessName: null,
          }),
          [...gallery, free],
        ),
      ),
    ).toBe(PropertyErrorCode.DuplicatedUnitCode);
  });

  it('keeps its own number when it is edited (US-10, scenario 1)', () => {
    const store = gallery[0];
    const updated = store.update(
      new UpdateCommercialUnitCommand({
        code: 'A-03',
        floor: '2',
        areaSquareMeters: 25,
        businessName: 'Calzados Roma',
      }),
      gallery,
    );

    expect(updated.floor).toBe('2');
    expect(updated.businessName).toBe('Calzados Roma');
  });

  it('registers a common area without tenant and rejects a repeated name (US-57)', () => {
    const area = CommercialUnit.register(
      'gal-001',
      command({ type: UnitType.CommonArea, code: 'Patio de comidas', businessName: 'X' }),
      gallery,
    );

    expect(area.isCommonArea).toBe(true);
    expect(area.code).toBe('Patio de comidas');
    expect(area.businessName).toBeNull();
    expect(area.canReceiveTenant()).toBe(false);
    expect(
      errorOf(() =>
        CommercialUnit.register(
          'gal-001',
          command({ type: UnitType.CommonArea, code: 'pasillo NORTE' }),
          gallery,
        ),
      ),
    ).toBe(PropertyErrorCode.DuplicatedCommonAreaName);
  });

  it('rejects invalid data (TS-08, scenario 2)', () => {
    expect(errorOf(() => CommercialUnit.register('gal-001', command({ code: ' ' }), gallery))).toBe(
      PropertyErrorCode.InvalidUnitCode,
    );
    expect(errorOf(() => CommercialUnit.register('gal-001', command({ floor: '' }), gallery))).toBe(
      PropertyErrorCode.InvalidFloor,
    );
    expect(
      errorOf(() => CommercialUnit.register('gal-001', command({ areaSquareMeters: 0 }), gallery)),
    ).toBe(PropertyErrorCode.InvalidArea);
  });

  it('is removed logically only without devices or tenant (US-11)', () => {
    const free = unit('unit-a10', 'A-10');

    expect(free.remove([]).active).toBe(false);
    expect(errorOf(() => free.remove(['SP-ESP32-0431']))).toBe(PropertyErrorCode.UnitHasDevices);
    expect(errorOf(() => gallery[0].remove([]))).toBe(PropertyErrorCode.UnitOccupied);
  });

  it('changes its occupancy and maintenance status', () => {
    const free = unit('unit-a10', 'A-10');

    expect(free.assignTenant().status).toBe(UnitStatus.Occupied);
    expect(gallery[0].vacate().status).toBe(UnitStatus.Available);
    expect(free.markUnderMaintenance().endMaintenance().status).toBe(UnitStatus.Available);
    expect(errorOf(() => gallery[0].assignTenant())).toBe(PropertyErrorCode.UnitNotAvailable);
    expect(errorOf(() => gallery[0].markUnderMaintenance())).toBe(PropertyErrorCode.UnitOccupied);
    expect(errorOf(() => gallery[1].assignTenant())).toBe(
      PropertyErrorCode.CommonAreaWithoutTenant,
    );
  });
});
