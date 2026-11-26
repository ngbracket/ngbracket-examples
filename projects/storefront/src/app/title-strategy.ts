import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

/** Each page's own name first, then the shop's, so tabs and screen readers tell pages apart. */
@Injectable({ providedIn: 'root' })
export class StoreTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const page = this.buildTitle(snapshot);
    this.title.setTitle(page ? `${page} — Aurora` : 'Aurora — Shop');
  }
}
