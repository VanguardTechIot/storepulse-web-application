/**
 * Origin of the critical event that generated the notification (Dashboard and Analytics).
 * The value doubles as the i18n key suffix (`analytics.notification_types.<type>`).
 */
export enum NotificationType {
  SafetyAlert = 'SAFETY_ALERT',
  ConnectivityAlert = 'CONNECTIVITY_ALERT',
  ConsumptionDeviation = 'CONSUMPTION_DEVIATION',
}
