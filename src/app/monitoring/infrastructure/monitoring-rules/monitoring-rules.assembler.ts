import { BaseAssembler } from '../../../shared/infrastructure/base-assembler';
import { MonitoringRule } from '../../domain/model/monitoring-rule.entity';
import { Threshold } from '../../domain/model/threshold';
import { MonitoringRuleResource } from './monitoring-rules.response';

export class MonitoringRuleAssembler implements BaseAssembler<
  MonitoringRule,
  MonitoringRuleResource
> {
  toEntityFromResource(r: MonitoringRuleResource): MonitoringRule {
    return new MonitoringRule(
      r.id,
      r.name,
      r.measurementType,
      new Threshold(r.threshold.value, r.threshold.operator),
      r.enabled,
      new Date(r.createdAt),
    );
  }

  toResourceFromEntity(e: MonitoringRule): MonitoringRuleResource {
    return {
      id: e.id,
      name: e.name,
      measurementType: e.measurementType,
      threshold: { value: e.threshold.value, operator: e.threshold.operator },
      enabled: e.enabled,
      createdAt: e.createdAt.toISOString(),
    };
  }

  toEntitiesFromResources(resources: MonitoringRuleResource[]): MonitoringRule[] {
    return resources.map((r) => this.toEntityFromResource(r));
  }
}
