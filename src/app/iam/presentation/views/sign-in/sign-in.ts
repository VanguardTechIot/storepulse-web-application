import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { Callout } from '../../../../shared/presentation/components/callout/callout';
import { appNav } from '../../../../shared/routing/app-nav';
import { IamStore } from '../../../application/iam.store';
import { SignInCommand } from '../../../domain/model/sign-in.command';
import { AuthenticationLayout } from '../../components/authentication-layout/authentication-layout';
import { iamNav } from '../../iam.nav';
import { emailValidator } from '../../iam.validators';

/**
 * Log In of the gallery administrator (mock-up 02, US-02 and US-05).
 */
@Component({
  selector: 'app-sign-in',
  imports: [
    AuthenticationLayout,
    Callout,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    ReactiveFormsModule,
    RouterLink,
    TranslatePipe,
  ],
  templateUrl: './sign-in.html',
})
export class SignIn {
  /** IAM application state used to authenticate the user. */
  protected readonly store = inject(IamStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  /** Navigation commands for IAM pages. */
  protected readonly iamNav = iamNav;
  /** Whether the password is currently hidden in the form. */
  protected readonly hidePassword = signal(true);
  /** Indicates that the user has just changed their password. */
  protected readonly passwordChanged = this.route.snapshot.queryParamMap.has('passwordChanged');
  /** Form containing the user's credentials and session persistence preference. */
  protected readonly form = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, emailValidator] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    keepSignedIn: new FormControl(true, { nonNullable: true }),
  });

  constructor() {
    this.store.clearError();
  }

  /**
   * Validates the form, signs the user in, and navigates to the requested or default page.
   */
  protected async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { email, password, keepSignedIn } = this.form.getRawValue();
    if (await this.store.signIn(new SignInCommand({ email, password }), keepSignedIn)) {
      await this.router.navigateByUrl(this.returnUrl());
    }
  }

  /**
   * Gets the in-app return URL or falls back to the dashboard.
   *
   * @returns A safe in-app URL to navigate to after sign-in.
   */
  private returnUrl(): string {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    if (returnUrl?.startsWith('/') && !returnUrl.startsWith('//')) return returnUrl;
    return this.router.serializeUrl(this.router.createUrlTree(appNav.dashboard));
  }
}
