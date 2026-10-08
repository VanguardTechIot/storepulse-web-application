import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { Callout } from '../../../../shared/presentation/components/callout/callout';
import { IamStore } from '../../../application/iam.store';
import { RequestPasswordResetCommand } from '../../../domain/model/request-password-reset.command';
import { AuthenticationLayout } from '../../components/authentication-layout/authentication-layout';
import { iamNav } from '../../iam.nav';
import { emailValidator } from '../../iam.validators';

/**
 * First step of the password recovery (US-03): request the 6-digit code by email.
 */
@Component({
  selector: 'app-forgot-password',
  imports: [
    AuthenticationLayout,
    Callout,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    ReactiveFormsModule,
    RouterLink,
    TranslatePipe,
  ],
  templateUrl: './forgot-password.html',
})
export class ForgotPassword {
  protected readonly store = inject(IamStore);
  private readonly router = inject(Router);

  protected readonly iamNav = iamNav;
  protected readonly form = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, emailValidator] }),
  });

  constructor() {
    this.store.clearError();
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.store
      .requestPasswordReset(new RequestPasswordResetCommand(this.form.getRawValue()))
      .subscribe(() => void this.router.navigate(iamNav.resetPassword()));
  }
}
