import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiError } from '../../../shared/domain/model/api-error';
import { sendRequest } from '../../../shared/infrastructure/send-request';
import { BillingDispute } from '../../domain/model/billing-dispute.entity';
import { BillingError, BillingErrorCode } from '../../domain/model/billing-error';
import { GenerateUtilityBillCommand } from '../../domain/model/generate-utility-bill.command';
import { UtilityBill } from '../../domain/model/utility-bill.entity';
import { UtilityBillingRepository } from '../../domain/repositories/utility-billing.repository';
import { BillingDisputeAssembler, UtilityBillAssembler } from '../acl/utility-billing-assemblers';
import {
  BillingDisputeResource,
  ResolveBillingDisputeResource,
  ReviewBillingDisputeResource,
  UtilityBillResource,
  VerifyBillingDataResource,
} from '../acl/utility-billing-responses';

const apiUrl = environment.platformProviderApiBaseUrl;
const billsUrl = `${apiUrl}${environment.platformProviderUtilityBillsEndpointPath}`;
const disputesUrl = `${apiUrl}${environment.platformProviderBillingDisputesEndpointPath}`;

const codes = new Set<string>(Object.values(BillingErrorCode));

/** The platform answers the business code in `message`; a bare 404 means the record is gone. */
const failed = (error: ApiError) => {
  if (error.isNetworkFailure) return new BillingError(BillingErrorCode.Network);
  if (codes.has(error.message)) return new BillingError(error.message as BillingErrorCode);
  return new BillingError(
    error.status === 404 ? BillingErrorCode.NotFound : BillingErrorCode.Unexpected,
  );
};

/** HTTP implementation of the repository over the StorePulse REST API. */
export class HttpUtilityBillingRepository implements UtilityBillingRepository {
  private readonly http = inject(HttpClient);
  private readonly billAssembler = new UtilityBillAssembler();
  private readonly disputeAssembler = new BillingDisputeAssembler();

  async listBills(): Promise<UtilityBill[]> {
    const resources = await sendRequest(this.http.get<UtilityBillResource[]>(billsUrl), failed);
    return resources.map((r) => this.billAssembler.toEntityFromResource(r));
  }

  getBill(billId: string): Promise<UtilityBill> {
    return this.sendBill(this.http.get<UtilityBillResource>(this.billUrl(billId)));
  }

  generateBill(command: GenerateUtilityBillCommand): Promise<UtilityBill> {
    const body = this.billAssembler.toResourceFromCommand(command);
    return this.sendBill(this.http.post<UtilityBillResource>(billsUrl, body));
  }

  verifyBillData(billId: string, acceptIncompleteData: boolean): Promise<UtilityBill> {
    const body: VerifyBillingDataResource = { acceptIncompleteData };
    const url = `${this.billUrl(billId)}/verify-data`;
    return this.sendBill(this.http.patch<UtilityBillResource>(url, body));
  }

  issueBill(billId: string): Promise<UtilityBill> {
    const url = `${this.billUrl(billId)}/issue`;
    return this.sendBill(this.http.patch<UtilityBillResource>(url, null));
  }

  async listDisputes(): Promise<BillingDispute[]> {
    const resources = await sendRequest(
      this.http.get<BillingDisputeResource[]>(disputesUrl),
      failed,
    );
    return resources.map((r) => this.disputeAssembler.toEntityFromResource(r));
  }

  reviewDispute(disputeId: string, reviewNotes: string): Promise<BillingDispute> {
    const body: ReviewBillingDisputeResource = { reviewNotes };
    const url = `${this.disputeUrl(disputeId)}/review`;
    return this.sendDispute(this.http.patch<BillingDisputeResource>(url, body));
  }

  resolveDispute(disputeId: string, resolution: string): Promise<BillingDispute> {
    const body: ResolveBillingDisputeResource = { resolution };
    const url = `${this.disputeUrl(disputeId)}/resolve`;
    return this.sendDispute(this.http.patch<BillingDisputeResource>(url, body));
  }

  private billUrl(billId: string): string {
    return `${billsUrl}/${encodeURIComponent(billId)}`;
  }

  private disputeUrl(disputeId: string): string {
    return `${disputesUrl}/${encodeURIComponent(disputeId)}`;
  }

  private async sendBill(request: Observable<UtilityBillResource>): Promise<UtilityBill> {
    return this.billAssembler.toEntityFromResource(await sendRequest(request, failed));
  }

  private async sendDispute(request: Observable<BillingDisputeResource>): Promise<BillingDispute> {
    return this.disputeAssembler.toEntityFromResource(await sendRequest(request, failed));
  }
}
