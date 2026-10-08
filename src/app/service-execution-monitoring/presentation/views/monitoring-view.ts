import { inject } from '@angular/core';
import { MonitoringStore } from '../../application/monitoring.store';
import { ToastService } from '../../../shared/presentation/components/toast-host/toast.service';
import { TranslationService } from '../../../shared/infrastructure/translation.service';

/**
 * Common behaviour of the monitoring views: initial load, manual refresh and localized messages.
 */
export abstract class MonitoringView {
  protected readonly store = inject(MonitoringStore);
  protected readonly toast = inject(ToastService);
  private readonly translation = inject(TranslationService);

  constructor() {
    // The error state is rendered by the view from store.hasError().
    this.store.load().catch(() => undefined);
  }

  protected async refresh(): Promise<void> {
    try {
      await this.store.load(true);
    } catch {
      this.showRequestError();
    }
  }

  protected showRequestError(): void {
    this.toast.show('error', this.t('common.states.errorTitle'), this.t('common.states.errorMessage'));
  }

  protected t(key: string, params?: Record<string, string | number>): string {
    return this.translation.translate(key, params);
  }
}
