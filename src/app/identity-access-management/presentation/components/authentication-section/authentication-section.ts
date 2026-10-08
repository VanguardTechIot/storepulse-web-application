import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { IamStore } from '../../../application/iam.store';
import { iamNav } from '../../iam.nav';

/**
 * Account menu of the top bar (mock-up 04b): who is signed in and the Log Out action (US-04).
 */
@Component({
  selector: 'app-authentication-section',
  imports: [
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    TranslatePipe,
  ],
  templateUrl: './authentication-section.html',
  styleUrl: './authentication-section.css',
})
export class AuthenticationSection {
  private readonly store = inject(IamStore);
  private readonly router = inject(Router);

  protected readonly user = this.store.currentUser;
  protected readonly initials = computed(
    () => this.user()?.email.slice(0, 2).toUpperCase() ?? '',
  );

  protected signOut(): void {
    this.store.signOut();
    void this.router.navigate(iamNav.signIn());
  }
}
