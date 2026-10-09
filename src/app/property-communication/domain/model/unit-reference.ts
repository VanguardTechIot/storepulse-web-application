/**
 * Store or common area of the gallery, translated from Property Management. Communication only
 * needs to name it and to know whether it can receive a tenant.
 */
export interface UnitReference {
  id: string;
  code: string;
  floor: string;
  businessName: string | null;
  isStore: boolean;
  isAvailable: boolean;
}
