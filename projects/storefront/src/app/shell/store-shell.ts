import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import {
  NgbrMarketingHeader,
  NgbrAnnouncementBar,
  NgbrFooter,
} from '@ngbracket/marketing';
import type { NgbrNavLink, NgbrFooterColumn } from '@ngbracket/marketing';
import { NgbrCartStore, NgbrMiniCart, NgbrCartDrawer } from '@ngbracket/commerce';
import type { NgbrCartQtyChange } from '@ngbracket/commerce';
import { SkipLink, ThemeToggle } from 'shared';

const NAV: NgbrNavLink[] = [
  { label: 'Shop', href: '/shop' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'Reviews', href: '/#reviews' },
  { label: 'FAQ', href: '/#faq' },
];

const FOOTER_COLS: NgbrFooterColumn[] = [
  { heading: 'Shop', links: [{ label: 'All products', href: '/shop' }, { label: 'New in', href: '/shop' }, { label: 'Gift cards', href: '/shop' }] },
  { heading: 'Help', links: [{ label: 'Shipping', href: '#' }, { label: 'Returns', href: '#' }, { label: 'Contact', href: '#' }] },
  { heading: 'Company', links: [{ label: 'About', href: '#' }, { label: 'Sustainability', href: '#' }] },
];

/** Storefront chrome: announcement bar, marketing header, cart drawer and footer. */
@Component({
  selector: 'store-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet,
    NgbrMarketingHeader,
    NgbrAnnouncementBar,
    NgbrFooter,
    NgbrMiniCart,
    NgbrCartDrawer,
    ThemeToggle,
    SkipLink,
  ],
  template: `
    <app-skip-link />
    <ngbr-announcement-bar (dismissed)="bannerGone.set(true)">
      Free UK delivery on orders over £40 — <a href="/shop">shop now</a>.
    </ngbr-announcement-bar>

    <ngbr-marketing-header [links]="nav" ctaLabel="Sign in" ctaHref="/signin" brandHref="/">
      <span ngbrBrand>Aurora</span>
      <app-theme-toggle ngbrHeaderActions />
      <ngbr-mini-cart ngbrHeaderActions [count]="store.count()" (open)="cartOpen.set(true)" />
    </ngbr-marketing-header>

    <ngbr-cart-drawer
      [(open)]="cartOpen"
      [items]="store.items()"
      (qtyChange)="onQty($event)"
      (remove)="store.remove($event)"
      (checkout)="checkout()"
    />

    <main id="main-content" tabindex="-1" class="store-main">
      <router-outlet />
    </main>

    <ngbr-footer [columns]="footerCols" [headingLevel]="2" copyright="© 2026 Aurora Goods Ltd.">
      <div ngbrFooterBrand class="foot-brand">Aurora</div>
      <a ngbrFooterLegal href="#">Privacy</a>
    </ngbr-footer>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .store-main {
        min-height: 60vh;
      }
      .foot-brand {
        font-weight: 700;
        font-size: 1.1rem;
      }
    `,
  ],
})
export class StoreShell {
  protected readonly store = inject(NgbrCartStore);
  private readonly router = inject(Router);

  protected readonly nav = NAV;
  protected readonly footerCols = FOOTER_COLS;
  protected readonly cartOpen = signal(false);
  protected readonly bannerGone = signal(false);

  protected onQty(change: NgbrCartQtyChange): void {
    this.store.setQty(change.id, change.quantity);
  }

  protected checkout(): void {
    this.cartOpen.set(false);
    void this.router.navigate(['/checkout']);
  }
}
