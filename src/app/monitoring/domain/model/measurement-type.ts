export type MeasurementType = 'TEMPERATURE' | 'HUMIDITY' | 'WATER' | 'ELECTRICITY' | 'MOTION';

export const MEASUREMENT_TYPES: readonly MeasurementType[] = ['TEMPERATURE', 'HUMIDITY', 'ELECTRICITY', 'WATER', 'MOTION'];

export type ConsumptionType = Extract<MeasurementType, 'ELECTRICITY' | 'WATER'>;

export const CONSUMPTION_TYPES: readonly ConsumptionType[] = ['ELECTRICITY', 'WATER'];

export const MEASUREMENT_UNITS: Record<MeasurementType, string> = {
  TEMPERATURE: '°C',
  HUMIDITY: '%',
  ELECTRICITY: 'kWh',
  WATER: 'm³',
  MOTION: '',
};
