import { BillingDispute } from '../../domain/model/billing-dispute.entity';
import { GenerateUtilityBillCommand } from '../../domain/model/generate-utility-bill.command';
import { UtilityBill } from '../../domain/model/utility-bill.entity';
import { BillingItem } from '../../domain/value-objects/billing-item.value-object';
import { BillingMonth } from '../../domain/value-objects/billing-month.value-object';
import {
  BillingDisputeResource,
  GenerateUtilityBillResource,
  UtilityBillResource,
} from './utility-billing-responses';

const date = (value: string | null) => (value ? new Date(value) : null);

/** A date without time (`yyyy-MM-dd`) read as that day in local time. */
const localDay = (value: string | null) => (value ? new Date(`${value}T00:00:00`) : null);

export class UtilityBillAssembler {
  toEntityFromResource(r: UtilityBillResource): UtilityBill {
    return UtilityBill.restore({
      id: String(r.id),
      code: r.code,
      unitId: String(r.unitId),
      unitCode: r.unitCode,
      unitName: r.unitName ?? '',
      tenantName: r.tenantName ?? '',
      period: new BillingMonth(r.periodStart.slice(0, 7)),
      status: r.status,
      items: r.items.map(
        (i) =>
          new BillingItem(
            i.utilityType,
            i.consumption,
            i.baseline,
            i.unitOfMeasure,
            i.rate,
            i.amount,
          ),
      ),
      totalAmount: r.totalAmount,
      dataCompleteness: r.dataCompleteness,
      dataWarningAccepted: r.dataWarningAccepted,
      issuedAt: date(r.issuedAt),
      dueDate: localDay(r.dueDate),
    });
  }

  toResourceFromCommand(command: GenerateUtilityBillCommand): GenerateUtilityBillResource {
    return { unitId: Number(command.unit.id), period: command.period.value };
  }
}

// Disputes are raised by tenants from the mobile application: the web only maps them inbound.
export class BillingDisputeAssembler {
  toEntityFromResource(r: BillingDisputeResource): BillingDispute {
    return BillingDispute.restore({
      id: String(r.id),
      utilityBillId: String(r.utilityBillId),
      tenantId: String(r.tenantId),
      reason: r.reason,
      description: r.description ?? '',
      status: r.status,
      reviewNotes: r.reviewNotes,
      resolution: r.resolution,
      createdAt: new Date(r.createdAt),
      resolvedAt: date(r.resolvedAt),
    });
  }
}
