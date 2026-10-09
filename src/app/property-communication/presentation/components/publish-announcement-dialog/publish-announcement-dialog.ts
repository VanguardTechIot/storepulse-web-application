import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { Callout } from '../../../../shared/presentation/components/callout/callout';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { TenantNotificationsStore } from '../../../application/tenant-notifications.store';
import { NotificationChannel } from '../../../domain/model/notification-channel.enum';
import { NotificationType } from '../../../domain/model/notification-type.enum';
import { PublishAnnouncementCommand } from '../../../domain/model/publish-announcement.command';
import { TenantNotification } from '../../../domain/model/tenant-notification.entity';
import { notBlankValidator } from '../../communication.validators';

type AnnouncementType = NotificationType.Announcement | NotificationType.Incident;

/**
 * Publishes a communication to the affected tenants (US-34) or notifies an incident (US-35). An
 * incident in a common area reaches every tenant of the gallery (US-35, scenario 2).
 */
@Component({
  selector: 'app-publish-announcement-dialog',
  imports: [
    Callout,
    MatButtonModule,
    MatButtonToggleModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatRadioModule,
    MatSelectModule,
    ReactiveFormsModule,
    TranslatePipe,
  ],
  templateUrl: './publish-announcement-dialog.html',
  styles: `
    .form {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding-top: 4px;
    }
    .type {
      margin-bottom: 16px;
    }
    .scope {
      display: flex;
      flex-wrap: wrap;
      gap: 4px 16px;
      margin: 0 0 12px;
    }
    app-callout {
      margin-bottom: 12px;
    }
  `,
})
export class PublishAnnouncementDialog {
  protected readonly store = inject(TenantNotificationsStore);
  private readonly dialogRef = inject(MatDialogRef<PublishAnnouncementDialog, boolean>);

  protected readonly NotificationType = NotificationType;
  protected readonly channels = Object.values(NotificationChannel);
  protected readonly titleMaxLength = TenantNotification.titleMaxLength;
  protected readonly bodyMaxLength = TenantNotification.bodyMaxLength;

  protected readonly form = new FormGroup({
    type: new FormControl<AnnouncementType>(NotificationType.Announcement, { nonNullable: true }),
    scope: new FormControl<'ALL' | 'UNITS'>('ALL', { nonNullable: true }),
    unitIds: new FormControl<string[]>([], { nonNullable: true }),
    title: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        notBlankValidator,
        Validators.maxLength(TenantNotification.titleMaxLength),
      ],
    }),
    body: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        notBlankValidator,
        Validators.maxLength(TenantNotification.bodyMaxLength),
      ],
    }),
    channel: new FormControl<NotificationChannel>(NotificationChannel.Push, { nonNullable: true }),
  });

  private readonly selectedIds = toSignal(this.form.controls.unitIds.valueChanges, {
    initialValue: [],
  });
  private readonly scope = toSignal(this.form.controls.scope.valueChanges, {
    initialValue: 'ALL' as const,
  });

  /** Selecting a common area reaches every tenant, so it is pointed out. */
  protected readonly includesCommonArea = computed(
    () =>
      this.scope() === 'UNITS' &&
      this.selectedIds().some((id) => this.store.directory.unit(id)?.isStore === false),
  );

  constructor() {
    this.store.clearError();
  }

  protected tenantOfUnitLabel(unitId: string): string {
    return this.store.directory.unitLabel(unitId);
  }

  protected async submit(): Promise<void> {
    const { type, scope, unitIds, title, body, channel } = this.form.getRawValue();
    if (scope === 'UNITS' && unitIds.length === 0) {
      this.form.controls.unitIds.setErrors({ required: true });
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const command = new PublishAnnouncementCommand({
      type,
      unitIds: scope === 'UNITS' ? unitIds : [],
      wholeGallery: scope === 'ALL',
      title,
      body,
      channel,
    });
    if (await this.store.publish(command)) this.dialogRef.close(true);
  }
}
