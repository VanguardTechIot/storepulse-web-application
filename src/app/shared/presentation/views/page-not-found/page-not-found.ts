import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../../components/icon/icon';
import { ViewState } from '../../components/view-state/view-state';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-page-not-found',
  imports: [RouterLink, Icon, ViewState, TranslatePipe],
  template: `
    <div class="card">
      <app-view-state icon="search" [title]="'notFound.title' | translate" [message]="'notFound.message' | translate">
        <a routerLink="/monitoring/overview" class="btn btn-primary btn-sm">
          <app-icon name="arrowleft" [size]="16" />{{ 'notFound.action' | translate }}
        </a>
      </app-view-state>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageNotFound {}
