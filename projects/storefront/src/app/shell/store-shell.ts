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
import { ThemeToggle } from 'shared';

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
  ],
  template: `
    <ngbr-announcement-bar (dismissed)="bannerGone.set(true)">
      Free UK delivery on orders over £40 — <a href="/shop">shop now</a>.
    </ngbr-announcement-bar>

    <div class="header-row">
      <ngbr-marketing-header [links]="nav" ctaLabel="Sign in" ctaHref="/signin" brandHref="/">
        <span ngbrBrand>Aurora</span>
      </ngbr-marketing-header>

      <div class="cart-fab">
        <app-theme-toggle />
        <ngbr-mini-cart [count]="store.count()" (open)="cartOpen.set(true)" />
      </div>
    </div>

    <ngbr-cart-drawer
      [(open)]="cartOpen"
      [items]="store.items()"
      (qtyChange)="onQty($event)"
      (remove)="store.remove($event)"
      (checkout)="checkout()"
    />

    <main class="store-main">
      <router-outlet />
    </main>

    <ngbr-footer [columns]="footerCols" copyright="© 2026 Aurora Goods Ltd.">
      <div ngbrFooterBrand class="foot-brand">Aurora</div>
      <a ngbrFooterLegal href="#">Privacy</a>
    </ngbr-footer>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      /* The header + the theme toggle / mini-cart form one sticky unit, so the
         controls live in the toolbar from load and stay with it on scroll. The
         marketing header's own sticky is neutralised; .header-row is the sticky. */
      .header-row {
        position: sticky;
        top: 0;
        z-index: 40;
      }
      :host ::ng-deep .header-row > ngbr-marketing-header {
        position: static !important;
      }
      .cart-fab {
        position: absolute;
        top: 9px;
        right: clamp(16px, 2vw, 28px);
        display: flex;
        align-items: center;
        gap: 8px;
      }
      /* Reserve room on the right of the header so its CTA / mobile menu button
         don't collide with the floating controls. Only needed until the header
         is centred well clear of the corner on very wide screens. */
      @media (max-width: 1360px) {
        :host ::ng-deep .ngbr-mh__bar {
          padding-right: 128px;
        }
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
