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
  protected readonly store = inject(IamStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly iamNav = iamNav;
  protected readonly hidePassword = signal(true);
  protected readonly passwordChanged = this.route.snapshot.queryParamMap.has('passwordChanged');
  protected readonly form = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, emailValidator] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    keepSignedIn: new FormControl(true, { nonNullable: true }),
  });

  constructor() {
    this.store.clearError();
  }

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

  /** Goes back to the page that required the session, accepting only in-app paths. */
  private returnUrl(): string {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    if (returnUrl?.startsWith('/') && !returnUrl.startsWith('//')) return returnUrl;
    return this.router.serializeUrl(this.router.createUrlTree(appNav.dashboard));
  }
}
