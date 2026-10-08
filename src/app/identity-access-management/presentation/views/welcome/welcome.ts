import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
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
    MatDividerModule,
    MatIconModule,
    RouterLink,
    TranslatePipe,
  ],
  templateUrl: './welcome.html',
  styleUrl: './welcome.css',
})
export class Welcome {
  protected readonly iamNav = iamNav;
}
