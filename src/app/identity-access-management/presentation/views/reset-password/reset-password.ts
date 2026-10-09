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
    TranslatePipe,
  ],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword {
  protected readonly store = inject(IamStore);
  private readonly router = inject(Router);

  protected readonly iamNav = iamNav;
  protected readonly validityInMinutes = PasswordRecovery.validityInMinutes;
  protected readonly hidePassword = signal(true);
  protected readonly codeResent = signal(false);
  protected readonly form = new FormGroup({
    code: new FormControl('', { nonNullable: true, validators: [Validators.required, resetCodeValidator] }),
    newPassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, passwordPolicyValidator],
    }),
  });
  protected readonly newPassword = toSignal(this.form.controls.newPassword.valueChanges, {
    initialValue: '',
  });

  private readonly now = toSignal(interval(1000).pipe(map(() => Date.now())), {
    initialValue: Date.now(),
  });
  private readonly remainingSeconds = computed(() => {
    const expiresAt = this.store.passwordRecovery()?.expiresAt;
    if (!expiresAt) return 0;
    return Math.max(0, Math.ceil((expiresAt.getTime() - this.now()) / 1000));
  });
  protected readonly codeExpired = computed(() => this.remainingSeconds() === 0);
  protected readonly remainingTime = computed(() => {
    const seconds = this.remainingSeconds();
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  });

  constructor() {
    this.store.clearError();
  }

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
