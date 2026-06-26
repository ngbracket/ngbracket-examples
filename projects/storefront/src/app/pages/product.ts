import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  NgbrProductGallery,
  NgbrPriceTag,
  NgbrRating,
  NgbrQuantityStepper,
  NgbrReviewList,
  NgbrRatingSummary,
  NgbrCartStore,
} from '@ngbracket/commerce';

import { productById, REVIEWS } from '../data/shop-data';

/** Product detail — gallery, price, quantity, add-to-cart and reviews. */
@Component({
  selector: 'store-product',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    NgbrProductGallery,
    NgbrPriceTag,
    NgbrRating,
    NgbrQuantityStepper,
    NgbrReviewList,
    NgbrRatingSummary,
  ],
  template: `
    @if (product(); as p) {
      <div class="pd">
        <a class="back" routerLink="/shop">← Back to shop</a>

        <div class="pd__top">
          <ngbr-product-gallery [images]="p.gallery" [alt]="p.title" />

          <div class="pd__info">
            <h1>{{ p.title }}</h1>
            <ngbr-rating [value]="p.rating ?? 0" [reviewCount]="p.reviewCount ?? 0" />
            <ngbr-price-tag [price]="p.price" [compareAt]="p.compareAt ?? 0" [currency]="p.currency ?? 'GBP'" />
            <p class="pd__blurb">{{ p.blurb }}</p>

            <div class="pd__buy">
              <ngbr-quantity-stepper [(value)]="qty" [minQty]="1" [maxQty]="9" />
              <button type="button" class="add" (click)="add()">Add to cart</button>
            </div>
            @if (added()) {
              <p class="added" role="status">Added {{ qty() }} × {{ p.title }} to your cart.</p>
            }
          </div>
        </div>

        <section class="pd__reviews">
          <h2>Reviews</h2>
          <div class="pd__reviews-grid">
            <ngbr-rating-summary [reviews]="reviews" />
            <ngbr-review-list [reviews]="reviews" />
          </div>
        </section>
      </div>
    } @else {
      <p class="missing">Product not found. <a routerLink="/shop">Back to shop</a>.</p>
    }
  `,
  styles: [
    `
      .pd {
        max-width: 1120px;
        margin-inline: auto;
        padding: clamp(20px, 4vw, 40px) clamp(16px, 5vw, 32px) 64px;
      }
      .back {
        display: inline-block;
        margin-bottom: 20px;
        color: var(--ngbr-color-accent);
      }
      .pd__top {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 36px;
      }
      .pd__info h1 {
        margin: 0 0 8px;
      }
      .pd__blurb {
        color: var(--ngbr-color-text-muted);
        line-height: 1.6;
      }
      .pd__buy {
        display: flex;
        align-items: center;
        gap: 14px;
        margin-top: 20px;
      }
      .add {
        padding: 11px 22px;
        font: inherit;
        font-weight: 600;
        color: var(--ngbr-color-accent-contrast, #fff);
        background: var(--ngbr-color-accent);
        border: 0;
        border-radius: var(--ngbr-radius);
        cursor: pointer;
      }
      .add:focus-visible {
        outline: 2px solid var(--ngbr-color-accent);
        outline-offset: 2px;
      }
      .added {
        margin-top: 12px;
        color: var(--ngbr-color-accent);
        font-weight: 600;
      }
      .pd__reviews {
        margin-top: 56px;
      }
      .pd__reviews-grid {
        display: grid;
        grid-template-columns: minmax(220px, 320px) 1fr;
        gap: 28px;
        align-items: start;
      }
      @media (max-width: 640px) {
        .pd__reviews-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class Product {
  /** Route param (component input binding). */
  readonly id = input.required<string>();

  private readonly store = inject(NgbrCartStore);
  protected readonly product = computed(() => productById(this.id()));
  protected readonly reviews = REVIEWS;
  protected readonly qty = signal(1);
  protected readonly added = signal(false);

  protected add(): void {
    const p = this.product();
    if (!p) return;
    this.store.add({
      id: p.id,
      title: p.title,
      price: p.price,
      currency: p.currency,
      quantity: this.qty(),
      image: p.image,
    });
    this.added.set(true);
  }
}
