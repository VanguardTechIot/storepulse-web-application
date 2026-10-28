import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { ToneIcon } from '../../../../shared/presentation/components/tone-icon/tone-icon';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { AuthenticationLayout } from '../../components/authentication-layout/authentication-layout';
import { iamNav } from '../../iam.nav';

/**
 * Entry point of the web application (mock-up 01).
 */
@Component({
  selector: 'app-welcome',
  imports: [
    AuthenticationLayout,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    RouterLink,
    ToneIcon,
    TranslatePipe,
  ],
  templateUrl: './welcome.html',
})
export class Welcome {
  /** Navigation commands for IAM pages. */
  protected readonly iamNav = iamNav;
}
