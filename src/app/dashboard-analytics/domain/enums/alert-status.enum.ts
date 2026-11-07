/** Life cycle of an alert: it is acknowledged first and resolved after. */
export enum AlertStatus {
  Active = 'ACTIVE',
  Acknowledged = 'ACKNOWLEDGED',
  Resolved = 'RESOLVED',
}
