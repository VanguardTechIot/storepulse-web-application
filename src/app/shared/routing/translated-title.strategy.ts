import { inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

const brandName = 'StorePulse';

/**
 * Uses the route `title` as a translation key, so the browser tab follows the selected language.
 */
@Injectable({ providedIn: 'root' })
export class TranslatedTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly translate = inject(TranslateService);
  private lastSnapshot: RouterStateSnapshot | null = null;

  constructor() {
    super();
    this.translate.onLangChange
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.lastSnapshot && this.updateTitle(this.lastSnapshot));
  }

  override updateTitle(snapshot: RouterStateSnapshot): void {
    this.lastSnapshot = snapshot;
    const titleKey = this.buildTitle(snapshot);
    this.title.setTitle(
      titleKey ? `${brandName} · ${this.translate.instant(titleKey)}` : brandName,
    );
  }
}
