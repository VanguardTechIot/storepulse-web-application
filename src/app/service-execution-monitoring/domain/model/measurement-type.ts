/**
 * Measurement types defined for StorePulse telemetry.
 */
export type MeasurementType = 'TEMPERATURE' | 'HUMIDITY' | 'WATER' | 'ELECTRICITY';

export const MEASUREMENT_TYPES: readonly MeasurementType[] = ['TEMPERATURE', 'HUMIDITY', 'ELECTRICITY', 'WATER'];

/** Measurement types that represent utility consumption. */
export type ConsumptionType = Extract<MeasurementType, 'ELECTRICITY' | 'WATER'>;

export const CONSUMPTION_TYPES: readonly ConsumptionType[] = ['ELECTRICITY', 'WATER'];

/** Unit used by each measurement type. */
export const MEASUREMENT_UNITS: Record<MeasurementType, string> = {
  TEMPERATURE: '°C',
  HUMIDITY: '%',
  ELECTRICITY: 'kWh',
  WATER: 'm³',
};
