import { NotificationType } from '../../domain/model/notification-type.enum';
import { UtilityType } from '../../domain/model/utility-type.enum';
import { ConsumptionRegistrationResource, NotificationResource } from '../analytics-responses';

/** In-memory data of Dashboard and Analytics (mock-ups 04 and 04a). */
export const NOTIFICATIONS: NotificationResource[] = [
  {
    id: 'ntf-0012',
    type: NotificationType.SafetyAlert,
    relatedEntityId: 'dev-b12-pir',
    location: 'Local B-12 · Ópticas Visión',
    message: 'Intrusión detectada fuera del horario de atención',
    generatedAt: '2026-10-09T03:41:00Z',
    read: false,
    occurrences: 1,
  },
  {
    id: 'ntf-0011',
    type: NotificationType.ConnectivityAlert,
    relatedEntityId: 'SP-ESP32-0417',
    location: 'Local C-07 · Librería El Saber',
    message: 'Falla técnica de dispositivo: voltaje 4.31 V',
    generatedAt: '2026-10-09T03:05:00Z',
    read: false,
    occurrences: 1,
  },
  {
    id: 'ntf-0010',
    type: NotificationType.ConnectivityAlert,
    relatedEntityId: 'SP-ESP32-0466',
    location: 'Local B-07 · Perfumería Aroma',
    message: 'Pérdida de conectividad durante 16 min',
    generatedAt: '2026-10-09T02:58:00Z',
    read: false,
    occurrences: 1,
  },
  {
    id: 'ntf-0009',
    type: NotificationType.ConsumptionDeviation,
    relatedEntityId: 'mtr-a03-e',
    location: 'Local A-03 · Calzados Roma',
    message: 'Consumo +38 % sobre la línea base fuera de horario',
    generatedAt: '2026-10-09T02:30:00Z',
    read: true,
    occurrences: 1,
  },
  // Four repeated events of the same sensor within 5 minutes: grouped into one (TS-30).
  {
    id: 'ntf-0008',
    type: NotificationType.SafetyAlert,
    relatedEntityId: 'dev-a01-reed',
    location: 'Local A-01 · Inca Gold',
    message: 'Apertura de puerta detectada',
    generatedAt: '2026-10-08T13:04:10Z',
    read: true,
    occurrences: 1,
  },
  {
    id: 'ntf-0007',
    type: NotificationType.SafetyAlert,
    relatedEntityId: 'dev-a01-reed',
    location: 'Local A-01 · Inca Gold',
    message: 'Apertura de puerta detectada',
    generatedAt: '2026-10-08T13:02:40Z',
    read: true,
    occurrences: 1,
  },
  {
    id: 'ntf-0006',
    type: NotificationType.SafetyAlert,
    relatedEntityId: 'dev-a01-reed',
    location: 'Local A-01 · Inca Gold',
    message: 'Apertura de puerta detectada',
    generatedAt: '2026-10-08T13:01:05Z',
    read: true,
    occurrences: 1,
  },
  {
    id: 'ntf-0005',
    type: NotificationType.SafetyAlert,
    relatedEntityId: 'dev-a01-reed',
    location: 'Local A-01 · Inca Gold',
    message: 'Apertura de puerta detectada',
    generatedAt: '2026-10-08T13:00:00Z',
    read: true,
    occurrences: 1,
  },
  {
    id: 'ntf-0004',
    type: NotificationType.SafetyAlert,
    relatedEntityId: 'dev-c03-mq2',
    location: 'Local C-03 · Comida Rápida Max',
    message: 'Humo detectado',
    generatedAt: '2026-10-07T23:05:00Z',
    read: true,
    occurrences: 1,
  },
  {
    id: 'ntf-0003',
    type: NotificationType.ConnectivityAlert,
    relatedEntityId: 'SP-ESP32-0359',
    location: 'Local A-01 · Inca Gold',
    message: 'Conectividad restablecida tras 22 min',
    generatedAt: '2026-10-07T12:12:00Z',
    read: true,
    occurrences: 1,
  },
];

const MONTHS_2025 = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
const MONTHS_2026 = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10'];

/** Gallery main meters: kWh (Luz del Sur) and m³ (Sedapal) per month. */
const ELECTRICITY_2025 = [
  12850, 13120, 12940, 12010, 11380, 10920, 10750, 10810, 11240, 11690, 12110, 12580,
];
const ELECTRICITY_2026 = [13210, 13480, 13350, 12420, 11760, 11290, 11080, 11620, 12070, 12480];
const WATER_2025 = [742, 768, 751, 702, 655, 621, 608, 612, 640, 668, 690, 721];
const WATER_2026 = [756, 781, 770, 718, 669, 634, 619, 626, 692, 684];

function registrations(
  utilityType: UtilityType,
  meterId: string,
  unit: string,
  year: number,
  months: string[],
  values: number[],
): ConsumptionRegistrationResource[] {
  return values.map((amount, i) => ({
    id: `cr-${meterId}-${year}${months[i]}`,
    meterId,
    utilityType,
    amount,
    unit,
    period: `${year}-${months[i]}`,
    capturedAt: `${year}-${months[i]}-28T05:00:00Z`,
  }));
}

export const CONSUMPTION_REGISTRATIONS: ConsumptionRegistrationResource[] = [
  ...registrations(
    UtilityType.Electricity,
    'mtr-main-e',
    'kWh',
    2025,
    MONTHS_2025,
    ELECTRICITY_2025,
  ),
  ...registrations(
    UtilityType.Electricity,
    'mtr-main-e',
    'kWh',
    2026,
    MONTHS_2026,
    ELECTRICITY_2026,
  ),
  ...registrations(UtilityType.Water, 'mtr-main-w', 'm³', 2025, MONTHS_2025, WATER_2025),
  ...registrations(UtilityType.Water, 'mtr-main-w', 'm³', 2026, MONTHS_2026, WATER_2026),
];
