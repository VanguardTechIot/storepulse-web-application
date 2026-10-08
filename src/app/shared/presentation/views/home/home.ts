import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';

/**
 * Temporary landing page of the authenticated area (empty state of mock-up 04d).
 * Dashboard and Analytics will replace it with the consolidated dashboard.
 */
@Component({
  selector: 'app-home',
  imports: [MatCardModule, MatIconModule, TranslatePipe],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}
