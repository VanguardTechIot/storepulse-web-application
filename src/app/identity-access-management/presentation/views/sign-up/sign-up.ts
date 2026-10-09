import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatStepperModule } from '@angular/material/stepper';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { Callout } from '../../../../shared/presentation/components/callout/callout';
import { appNav } from '../../../../shared/routing/app-nav';
import { IamStore } from '../../../application/iam.store';
import { SignUpCommand } from '../../../domain/model/sign-up.command';
import { AuthenticationLayout } from '../../components/authentication-layout/authentication-layout';
import { PasswordRequirements } from '../../components/password-requirements/password-requirements';
import { iamNav } from '../../iam.nav';
import { emailValidator, passwordPolicyValidator } from '../../iam.validators';

/**
 * First step of the registration flow: the gallery administrator account (mock-up 03, US-01).
 */
@Component({
  selector: 'app-sign-up',
  imports: [
    AuthenticationLayout,
    Callout,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatStepperModule,
    PasswordRequirements,
    ReactiveFormsModule,
    RouterLink,
    TranslatePipe,
  ],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.css',
})
export class SignUp {
  protected readonly store = inject(IamStore);
  private readonly router = inject(Router);

  protected readonly iamNav = iamNav;
  protected readonly appNav = appNav;
  protected readonly hidePassword = signal(true);
  protected readonly form = new FormGroup({
    fullName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(100)],
    }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, emailValidator] }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, passwordPolicyValidator],
    }),
    acceptTerms: new FormControl(false, { nonNullable: true, validators: [Validators.requiredTrue] }),
  });
  protected readonly password = toSignal(this.form.controls.password.valueChanges, {
    initialValue: '',
  });

  constructor() {
    this.store.clearError();
  }

  protected async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { fullName, email, password } = this.form.getRawValue();
    if (await this.store.signUp(new SignUpCommand({ fullName, email, password }))) {
      await this.router.navigate(appNav.galleryRegistration);
    }
  }
}
