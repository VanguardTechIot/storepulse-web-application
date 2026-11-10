import { Alert } from '../model/alert.entity';
import { DashboardSummary } from '../model/dashboard-summary';

/**
 * Access abstraction of Dashboard and Analytics: `/dashboard/summary` and the alerts the
 * administrator attends (`/alerts`). Business errors are thrown as `AnalyticsError`.
 */
export interface AnalyticsRepository {
  getSummary(): Promise<DashboardSummary>;
  /** Most recent first. */
  listAlerts(): Promise<Alert[]>;
  acknowledgeAlert(alertId: string): Promise<Alert>;
  resolveAlert(alertId: string, resolutionNote: string): Promise<Alert>;
}
