import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { TranslationService } from '../../shared/infrastructure/i18n/translation.service';
import { confirmAction } from '../../shared/presentation/components/confirmation-dialog/confirmation-dialog';
import { ToastService } from '../../shared/presentation/components/toast-host/toast.service';
import { PropertyManagementStore } from '../application/property-management.store';
import { CommercialUnit } from '../domain/model/commercial-unit.entity';
import { UnitType } from '../domain/model/unit-type.enum';
import { InviteTenantDialog } from './components/invite-tenant-dialog/invite-tenant-dialog';
import { UnitFormDialog, UnitFormData } from './components/unit-form-dialog/unit-form-dialog';

/**
 * Actions on a unit shared by the list and the detail: they open the dialogs, ask for
 * confirmation and report the outcome. Each one resolves to `true` when the unit changed.
 */
@Injectable({ providedIn: 'root' })
export class UnitActions {
  private readonly store = inject(PropertyManagementStore);
  private readonly dialog = inject(MatDialog);
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(TranslationService);

  /** US-09 and US-57. */
  async register(type: UnitType = UnitType.Store): Promise<boolean> {
    return this.openForm({ type }, 'property.unit_form.registered');
  }

  /** US-10. */
  async edit(unit: CommercialUnit): Promise<boolean> {
    return this.openForm({ unit }, 'property.unit_form.updated');
  }

  /** US-12. */
  async invite(unit: CommercialUnit): Promise<boolean> {
    const ref = this.dialog.open<InviteTenantDialog, CommercialUnit, boolean>(InviteTenantDialog, {
      data: unit,
      width: '520px',
    });
    const sent = (await firstValueFrom(ref.afterClosed())) === true;
    if (sent) this.toast.show('success', this.i18n.t('property.invite.sent', { unit: unit.code }));
    return sent;
  }

  async toggleMaintenance(unit: CommercialUnit): Promise<boolean> {
    const starting = !unit.isUnderMaintenance;
    const confirmed = await confirmAction(this.dialog, {
      title: this.i18n.t(
        starting ? 'property.maintenance.start_title' : 'property.maintenance.end_title',
        { unit: unit.code },
      ),
      message: this.i18n.t(
        starting ? 'property.maintenance.start_message' : 'property.maintenance.end_message',
      ),
      confirmLabel: this.i18n.t(
        starting ? 'property.actions.start_maintenance' : 'property.actions.end_maintenance',
      ),
      icon: 'construction',
    });
    if (!confirmed) return false;
    const ok = starting
      ? await this.store.markUnderMaintenance(unit.id)
      : await this.store.endMaintenance(unit.id);
    this.report(ok, starting ? 'property.maintenance.started' : 'property.maintenance.ended', unit);
    return ok;
  }

  /** US-11: logical removal, refused while devices are linked or a tenant occupies it. */
  async remove(unit: CommercialUnit): Promise<boolean> {
    const confirmed = await confirmAction(this.dialog, {
      title: this.i18n.t('property.remove.title', { unit: unit.code }),
      message: this.i18n.t('property.remove.message'),
      confirmLabel: this.i18n.t('property.actions.remove'),
      tone: 'danger',
      icon: 'delete',
    });
    if (!confirmed) return false;
    const ok = await this.store.removeUnit(unit.id);
    this.report(ok, 'property.remove.done', unit);
    return ok;
  }

  private async openForm(data: UnitFormData, successKey: string): Promise<boolean> {
    const ref = this.dialog.open<UnitFormDialog, UnitFormData, boolean>(UnitFormDialog, {
      data,
      width: '600px',
    });
    const saved = (await firstValueFrom(ref.afterClosed())) === true;
    if (saved) this.toast.show('success', this.i18n.t(successKey));
    return saved;
  }

  private report(ok: boolean, successKey: string, unit: CommercialUnit): void {
    if (ok) {
      this.toast.show('success', this.i18n.t(successKey, { unit: unit.code }));
      return;
    }
    const error = this.store.error();
    if (error) {
      this.toast.show('error', this.i18n.t(`property.errors.${error}`, this.store.errorDetails()));
      this.store.clearError();
    }
  }
}
