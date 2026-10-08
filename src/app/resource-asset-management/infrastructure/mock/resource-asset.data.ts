import {
  AssetResource,
  IoTDeviceResource,
  MeterResource,
  ResourceResource,
  SensorResource,
} from '../resource-asset-responses';

/** Datos en memoria de Resource and Asset Management. */
export const RESOURCES: ResourceResource[] = [
  { id: 'res-a03', name: 'Local A-03', description: 'Calzados Roma', location: {address: 'Jr. de la Unión 845, Cercado de Lima', floor: '1', reference: 'Pasillo A'}, status: 'ACTIVE' },
  { id: 'res-a07', name: 'Local A-07', description: 'Perfumería Aroma', location: {address: 'Jr. de la Unión 845, Cercado de Lima', floor: '1', reference: 'Pasillo A'}, status: 'ACTIVE' },
  { id: 'res-b09', name: 'Local B-09', description: 'Joyería Inca Gold', location: {address: 'Jr. de la Unión 845, Cercado de Lima', floor: '2', reference: 'Pasillo B'}, status: 'ACTIVE' },
  { id: 'res-b12', name: 'Local B-12', description: 'Ópticas Visión', location: {address: 'Jr. de la Unión 845, Cercado de Lima', floor: '2', reference: 'Pasillo B'}, status: 'ACTIVE' },
  { id: 'res-c03', name: 'Local C-03', description: 'Comida Rápida Max', location: {address: 'Jr. de la Unión 845, Cercado de Lima', floor: '3', reference: 'Patio de comidas'}, status: 'ACTIVE' },
  { id: 'res-c07', name: 'Local C-07', description: 'Joyería Lumen', location: {address: 'Jr. de la Unión 845, Cercado de Lima', floor: '3', reference: 'Pasillo C'}, status: 'MAINTENANCE' },
  { id: 'res-cn01', name: 'Pasillo norte', description: 'Área común', location: {address: 'Jr. de la Unión 845, Cercado de Lima', floor: '1', reference: 'Ingreso norte'}, status: 'ACTIVE' },
];

export const ASSETS: AssetResource[] = [
  { id: 'ast-001', name: 'Nodo IoT Local A-03', type: 'IOT_DEVICE', status: 'ACTIVE', resourceId: 'res-a03' },
  { id: 'ast-002', name: 'Nodo IoT Local A-07', type: 'IOT_DEVICE', status: 'ACTIVE', resourceId: 'res-a07' },
  { id: 'ast-003', name: 'Nodo IoT Local B-09', type: 'IOT_DEVICE', status: 'ACTIVE', resourceId: 'res-b09' },
  { id: 'ast-004', name: 'Nodo IoT Local B-12', type: 'IOT_DEVICE', status: 'ACTIVE', resourceId: 'res-b12' },
  { id: 'ast-005', name: 'Nodo IoT Local C-03', type: 'IOT_DEVICE', status: 'ACTIVE', resourceId: 'res-c03' },
  { id: 'ast-006', name: 'Nodo IoT Local C-07', type: 'IOT_DEVICE', status: 'MAINTENANCE', resourceId: 'res-c07' },
  { id: 'ast-007', name: 'Nodo IoT Pasillo norte', type: 'IOT_DEVICE', status: 'ACTIVE', resourceId: 'res-cn01' },
];

export const IOT_DEVICES: IoTDeviceResource[] = [
  { id: 'dev-001', assetId: 'ast-001', serialNumber: 'SP-ESP32-0431', manufacturer: 'Espressif Systems', firmwareVersion: '1.4.2', status: 'ACTIVE' },
  { id: 'dev-002', assetId: 'ast-002', serialNumber: 'SP-ESP32-0438', manufacturer: 'Espressif Systems', firmwareVersion: '1.4.2', status: 'ACTIVE' },
  { id: 'dev-003', assetId: 'ast-003', serialNumber: 'SP-ESP32-0447', manufacturer: 'Espressif Systems', firmwareVersion: '1.4.2', status: 'ACTIVE' },
  { id: 'dev-004', assetId: 'ast-004', serialNumber: 'SP-ESP32-0452', manufacturer: 'Espressif Systems', firmwareVersion: '1.4.2', status: 'ACTIVE' },
  { id: 'dev-005', assetId: 'ast-005', serialNumber: 'SP-ESP32-0463', manufacturer: 'Espressif Systems', firmwareVersion: '1.4.2', status: 'ACTIVE' },
  { id: 'dev-006', assetId: 'ast-006', serialNumber: 'SP-ESP32-0467', manufacturer: 'Espressif Systems', firmwareVersion: '1.4.2', status: 'INACTIVE' },
  { id: 'dev-007', assetId: 'ast-007', serialNumber: 'SP-ESP32-0401', manufacturer: 'Espressif Systems', firmwareVersion: '1.4.2', status: 'ACTIVE' },
];

export const SENSORS: SensorResource[] = [
  { id: 'sen-001-t', iotDeviceId: 'dev-001', type: 'TEMPERATURE', unit: '°C', status: 'ACTIVE' },
  { id: 'sen-001-h', iotDeviceId: 'dev-001', type: 'HUMIDITY', unit: '%', status: 'ACTIVE' },
  { id: 'sen-002-t', iotDeviceId: 'dev-002', type: 'TEMPERATURE', unit: '°C', status: 'ACTIVE' },
  { id: 'sen-002-h', iotDeviceId: 'dev-002', type: 'HUMIDITY', unit: '%', status: 'ACTIVE' },
  { id: 'sen-003-t', iotDeviceId: 'dev-003', type: 'TEMPERATURE', unit: '°C', status: 'ACTIVE' },
  { id: 'sen-003-h', iotDeviceId: 'dev-003', type: 'HUMIDITY', unit: '%', status: 'ACTIVE' },
  { id: 'sen-004-t', iotDeviceId: 'dev-004', type: 'TEMPERATURE', unit: '°C', status: 'ACTIVE' },
  { id: 'sen-004-h', iotDeviceId: 'dev-004', type: 'HUMIDITY', unit: '%', status: 'ACTIVE' },
  { id: 'sen-005-t', iotDeviceId: 'dev-005', type: 'TEMPERATURE', unit: '°C', status: 'ACTIVE' },
  { id: 'sen-005-h', iotDeviceId: 'dev-005', type: 'HUMIDITY', unit: '%', status: 'ACTIVE' },
  { id: 'sen-006-t', iotDeviceId: 'dev-006', type: 'TEMPERATURE', unit: '°C', status: 'INACTIVE' },
  { id: 'sen-006-h', iotDeviceId: 'dev-006', type: 'HUMIDITY', unit: '%', status: 'INACTIVE' },
  { id: 'sen-007-t', iotDeviceId: 'dev-007', type: 'TEMPERATURE', unit: '°C', status: 'ACTIVE' },
  { id: 'sen-007-h', iotDeviceId: 'dev-007', type: 'HUMIDITY', unit: '%', status: 'ACTIVE' },
];

export const METERS: MeterResource[] = [
  { id: 'mtr-001-e', iotDeviceId: 'dev-001', type: 'ELECTRICITY', unit: 'kWh', status: 'ACTIVE' },
  { id: 'mtr-002-e', iotDeviceId: 'dev-002', type: 'ELECTRICITY', unit: 'kWh', status: 'ACTIVE' },
  { id: 'mtr-003-e', iotDeviceId: 'dev-003', type: 'ELECTRICITY', unit: 'kWh', status: 'ACTIVE' },
  { id: 'mtr-003-w', iotDeviceId: 'dev-003', type: 'WATER', unit: 'm³', status: 'ACTIVE' },
  { id: 'mtr-004-e', iotDeviceId: 'dev-004', type: 'ELECTRICITY', unit: 'kWh', status: 'ACTIVE' },
  { id: 'mtr-004-w', iotDeviceId: 'dev-004', type: 'WATER', unit: 'm³', status: 'ACTIVE' },
  { id: 'mtr-005-e', iotDeviceId: 'dev-005', type: 'ELECTRICITY', unit: 'kWh', status: 'ACTIVE' },
  { id: 'mtr-005-w', iotDeviceId: 'dev-005', type: 'WATER', unit: 'm³', status: 'ACTIVE' },
  { id: 'mtr-006-e', iotDeviceId: 'dev-006', type: 'ELECTRICITY', unit: 'kWh', status: 'INACTIVE' },
];
