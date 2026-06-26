import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NgbrProductCard, NgbrCartStore } from '@ngbracket/commerce';
import type { NgbrProduct } from '@ngbracket/commerce';

import { PRODUCTS } from '../data/shop-data';

/** Product catalogue — a responsive grid of product cards. */
@Component({
  selector: 'store-shop',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgbrProductCard],
  template: `
    <div class="shop">
      <header class="shop__head">
        <h1>Shop all</h1>
        <p>{{ products.length }} products, made to last.</p>
      </header>

      <div class="grid">
        @for (product of products; track product.id) {
          <ngbr-product-card [product]="product" (select)="open($event)" (addToCart)="add($event)" />
        }
      </div>
    </div>
  `,
  styles: [
    `
      .shop {
        max-width: 1120px;
        margin-inline: auto;
        padding: clamp(24px, 5vw, 48px) clamp(16px, 5vw, 32px) 64px;
      }
      .shop__head h1 {
        margin: 0 0 4px;
      }
      .shop__head p {
        margin: 0 0 24px;
        color: var(--ngbr-color-text-muted);
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
        gap: 20px;
      }
    `,
  ],
})
export class Shop {
  private readonly store = inject(NgbrCartStore);
  private readonly router = inject(Router);
  protected readonly products = PRODUCTS;

  protected open(product: NgbrProduct): void {
    void this.router.navigate(['/product', product.id]);
  }

  protected add(product: NgbrProduct): void {
    this.store.add({
      id: product.id,
      title: product.title,
      price: product.price,
      currency: product.currency,
      quantity: 1,
      image: product.image,
    });
  }
}
