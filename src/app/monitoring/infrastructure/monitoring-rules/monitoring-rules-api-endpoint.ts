import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { retryOnDroppedConnection } from '../../../shared/infrastructure/retry-on-dropped-connection';
import { MonitoringRule } from '../../domain/model/monitoring-rule.entity';
import { MonitoringRuleAssembler } from './monitoring-rules.assembler';
import { MonitoringRuleResource } from './monitoring-rules.response';

const MONITORING_RULES_URL = `${environment.platformProviderApiBaseUrl}${environment.platformProviderMonitoringRulesEndpointPath}`;

export class MonitoringRulesApiEndpoint {
  private readonly assembler = new MonitoringRuleAssembler();

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<MonitoringRule[]> {
    return this.http.get<MonitoringRuleResource[]>(MONITORING_RULES_URL).pipe(
      retryOnDroppedConnection(),
      map((resources) => this.assembler.toEntitiesFromResources(resources)),
    );
  }

  update(rule: MonitoringRule): Observable<MonitoringRule> {
    return this.http
      .put<MonitoringRuleResource>(
        `${MONITORING_RULES_URL}/${encodeURIComponent(rule.id)}`,
        this.assembler.toResourceFromEntity(rule),
      )
      .pipe(
        retryOnDroppedConnection(),
        map((resource) => this.assembler.toEntityFromResource(resource)),
      );
  }
}
