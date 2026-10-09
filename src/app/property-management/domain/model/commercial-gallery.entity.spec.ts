import { CommercialGallery } from './commercial-gallery.entity';
import { PropertyError, PropertyErrorCode } from './property-error';
import { RegisterCommercialGalleryCommand } from './register-commercial-gallery.command';
import { UpdateCommercialGalleryInfoCommand } from './update-commercial-gallery-info.command';

describe('CommercialGallery', () => {
  function register(changes: Partial<RegisterCommercialGalleryCommand> = {}): CommercialGallery {
    return CommercialGallery.register(
      'usr-001',
      new RegisterCommercialGalleryCommand({
        name: ' Galería Central ',
        address: 'Jr. de la Unión 845, Cercado de Lima',
        totalUnits: 40,
        ...changes,
      }),
    );
  }

  function errorOf(change: () => unknown): PropertyErrorCode | null {
    try {
      change();
      return null;
    } catch (error) {
      return error instanceof PropertyError ? error.code : null;
    }
  }

  it('registers the gallery of the administrator with trimmed data (US-08, scenario 1)', () => {
    const gallery = register();

    expect(gallery.name).toBe('Galería Central');
    expect(gallery.administratorId).toBe('usr-001');
    expect(gallery.totalUnits).toBe(40);
  });

  it('rejects empty mandatory fields (US-08, scenario 2; TS-05, scenario 2)', () => {
    expect(errorOf(() => register({ name: '  ' }))).toBe(PropertyErrorCode.InvalidGalleryName);
    expect(errorOf(() => register({ address: '' }))).toBe(PropertyErrorCode.InvalidAddress);
    expect(errorOf(() => register({ totalUnits: 0 }))).toBe(PropertyErrorCode.InvalidTotalUnits);
    expect(errorOf(() => register({ totalUnits: 2.5 }))).toBe(PropertyErrorCode.InvalidTotalUnits);
  });

  it('updates the general data without altering the original', () => {
    const gallery = register();
    const updated = gallery.updateInfo(
      new UpdateCommercialGalleryInfoCommand({
        name: 'Galería Central Plaza',
        address: gallery.address,
        totalUnits: 42,
      }),
    );

    expect(updated.name).toBe('Galería Central Plaza');
    expect(updated.totalUnits).toBe(42);
    expect(gallery.name).toBe('Galería Central');
  });
});
