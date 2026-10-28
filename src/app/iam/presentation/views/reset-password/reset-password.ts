import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { interval, map } from 'rxjs';
import { Callout } from '../../../../shared/presentation/components/callout/callout';
import { ToneIcon } from '../../../../shared/presentation/components/tone-icon/tone-icon';
import { IamStore } from '../../../application/iam.store';
import { PasswordRecovery } from '../../../domain/model/password-recovery.entity';
import { RequestPasswordResetCommand } from '../../../domain/model/request-password-reset.command';
import { ResetPasswordCommand } from '../../../domain/model/reset-password.command';
import { AuthenticationLayout } from '../../components/authentication-layout/authentication-layout';
import { PasswordRequirements } from '../../components/password-requirements/password-requirements';
import { iamNav } from '../../iam.nav';
import { passwordPolicyValidator, resetCodeValidator } from '../../iam.validators';

/**
 * Second step of the password recovery (mock-up 02a, US-03): validate the code and set the new
 * password. The code is valid for 15 minutes and can be used once.
 */
@Component({
  selector: 'app-reset-password',
  imports: [
    AuthenticationLayout,
    Callout,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    PasswordRequirements,
    ReactiveFormsModule,
    RouterLink,
    ToneIcon,
    TranslatePipe,
  ],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword {
  /** IAM application state used to validate and complete password recovery. */
  protected readonly store = inject(IamStore);
  private readonly router = inject(Router);

  /** Navigation commands for IAM pages. */
  protected readonly iamNav = iamNav;
  /** Validity period for a password recovery code, in minutes. */
  protected readonly validityInMinutes = PasswordRecovery.validityInMinutes;
  /** Whether the new password is currently hidden in the form. */
  protected readonly hidePassword = signal(true);
  /** Whether a new reset code has been requested successfully. */
  protected readonly codeResent = signal(false);
  /** Form containing the reset code and new password. */
  protected readonly form = new FormGroup({
    code: new FormControl('', { nonNullable: true, validators: [Validators.required, resetCodeValidator] }),
    newPassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, passwordPolicyValidator],
    }),
  });
  /** Current new-password value for the password requirements checklist. */
  protected readonly newPassword = toSignal(this.form.controls.newPassword.valueChanges, {
    initialValue: '',
  });

  /** Current time, updated every second for the expiration countdown. */
  private readonly now = toSignal(interval(1000).pipe(map(() => Date.now())), {
    initialValue: Date.now(),
  });
  /** Seconds remaining until the current recovery code expires. */
  private readonly remainingSeconds = computed(() => {
    const expiresAt = this.store.passwordRecovery()?.expiresAt;
    if (!expiresAt) return 0;
    return Math.max(0, Math.ceil((expiresAt.getTime() - this.now()) / 1000));
  });
  /** Whether the current recovery code has expired. */
  protected readonly codeExpired = computed(() => this.remainingSeconds() === 0);
  /** Remaining validity time formatted as minutes and seconds. */
  protected readonly remainingTime = computed(() => {
    const seconds = this.remainingSeconds();
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  });

  constructor() {
    this.store.clearError();
  }

  /**
   * Validates the form and submits the password reset request.
   */
  protected async submit(): Promise<void> {
    const recovery = this.store.passwordRecovery();
    if (this.form.invalid || !recovery) {
      this.form.markAllAsTouched();
      return;
    }
    const { code, newPassword } = this.form.getRawValue();
    const command = new ResetPasswordCommand({ email: recovery.email, code, newPassword });
    if (await this.store.resetPassword(command)) {
      await this.router.navigate(iamNav.signIn(), { queryParams: { passwordChanged: true } });
    }
  }

  /**
   * Requests another recovery code and clears the previously entered code on success.
   */
  protected async resendCode(): Promise<void> {
    const recovery = this.store.passwordRecovery();
    if (!recovery) return;
    this.codeResent.set(false);
    const command = new RequestPasswordResetCommand({ email: recovery.email });
    if (await this.store.requestPasswordReset(command)) {
      this.form.controls.code.reset();
      this.codeResent.set(true);
    }
  }
}
