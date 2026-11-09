import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { ApiError } from '../../../shared/domain/model/api-error';
import { sendRequest } from '../../../shared/infrastructure/send-request';
import { Alert } from '../../domain/model/alert.entity';
import { AnalyticsError, AnalyticsErrorCode } from '../../domain/model/analytics-error';
import { DashboardSummary } from '../../domain/model/dashboard-summary';
import { AnalyticsRepository } from '../../domain/repositories/analytics.repository';
import { AlertAssembler, DashboardSummaryAssembler } from '../acl/analytics-assemblers';
import {
  AlertResource,
  DashboardSummaryResource,
  ResolveAlertResource,
} from '../acl/analytics-responses';

const apiUrl = environment.platformProviderApiBaseUrl;
const summaryUrl = `${apiUrl}${environment.platformProviderDashboardSummaryEndpointPath}`;
const alertsUrl = `${apiUrl}${environment.platformProviderAlertsEndpointPath}`;

const codes = new Set<string>(Object.values(AnalyticsErrorCode));

/** The platform answers the business code in `message`; a bare 404 means the alert is gone. */
const failed = (error: ApiError) => {
  if (error.isNetworkFailure) return new AnalyticsError(AnalyticsErrorCode.Network);
  if (codes.has(error.message)) return new AnalyticsError(error.message as AnalyticsErrorCode);
  return new AnalyticsError(
    error.status === 404 ? AnalyticsErrorCode.AlertNotFound : AnalyticsErrorCode.Unexpected,
  );
};

/** HTTP implementation of the repository over the StorePulse REST API. */
export class HttpAnalyticsRepository implements AnalyticsRepository {
  private readonly http = inject(HttpClient);
  private readonly summaryAssembler = new DashboardSummaryAssembler();
  private readonly alertAssembler = new AlertAssembler();

  async getSummary(): Promise<DashboardSummary> {
    const resource = await sendRequest(this.http.get<DashboardSummaryResource>(summaryUrl), failed);
    return this.summaryAssembler.toEntityFromResource(resource);
  }

  async listAlerts(): Promise<Alert[]> {
    const resources = await sendRequest(this.http.get<AlertResource[]>(alertsUrl), failed);
    return resources.map((r) => this.alertAssembler.toEntityFromResource(r));
  }

  async acknowledgeAlert(alertId: string): Promise<Alert> {
    const url = `${alertsUrl}/${encodeURIComponent(alertId)}/acknowledge`;
    const resource = await sendRequest(this.http.patch<AlertResource>(url, null), failed);
    return this.alertAssembler.toEntityFromResource(resource);
  }

  async resolveAlert(alertId: string, resolutionNote: string): Promise<Alert> {
    const url = `${alertsUrl}/${encodeURIComponent(alertId)}/resolve`;
    const body: ResolveAlertResource = { resolutionNote };
    const resource = await sendRequest(this.http.patch<AlertResource>(url, body), failed);
    return this.alertAssembler.toEntityFromResource(resource);
  }
}
