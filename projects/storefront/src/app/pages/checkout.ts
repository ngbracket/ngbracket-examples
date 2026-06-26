import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  NgbrCheckoutSteps,
  NgbrAddressForm,
  NgbrCouponField,
  NgbrPaymentShell,
  NgbrOrderReview,
  NgbrOrderSummary,
  NgbrCartStore,
} from '@ngbracket/commerce';
import type { NgbrAddress } from '@ngbracket/commerce';

const STEPS = ['Cart', 'Shipping', 'Payment', 'Review'];
const SHIPPING = 4.99;

/** Multi-step checkout: cart → shipping → payment → review. */
@Component({
  selector: 'store-checkout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    NgbrCheckoutSteps,
    NgbrAddressForm,
    NgbrCouponField,
    NgbrPaymentShell,
    NgbrOrderReview,
    NgbrOrderSummary,
  ],
  template: `
    <div class="co">
      <h1>Checkout</h1>

      @if (store.count() === 0 && !placed()) {
        <p class="empty">Your cart is empty. <a routerLink="/shop">Continue shopping</a>.</p>
      } @else if (placed()) {
        <div class="done" role="status">
          <h2>Thank you! 🎉</h2>
          <p>Your order is confirmed. A receipt is on its way to {{ address().name || 'your inbox' }}.</p>
          <a class="btn" routerLink="/shop">Continue shopping</a>
        </div>
      } @else {
        <ngbr-checkout-steps [steps]="steps" [current]="step()" />

        <div class="co__grid">
          <div class="co__main">
            @switch (step()) {
              @case (0) {
                <ngbr-order-review [items]="store.items()" [shipping]="shipping" />
              }
              @case (1) {
                <h2>Shipping address</h2>
                <ngbr-address-form [(value)]="address" />
                <h2 class="mt">Discount code</h2>
                <ngbr-coupon-field [(value)]="coupon" (apply)="applyCoupon($event)" />
                @if (couponMsg()) {
                  <p class="msg" role="status">{{ couponMsg() }}</p>
                }
              }
              @case (2) {
                <ngbr-payment-shell heading="Payment" note="Demo only — no card is charged.">
                  <div class="fakecard">Card details would go here (your PSP element).</div>
                </ngbr-payment-shell>
              }
              @case (3) {
                <ngbr-order-review [items]="store.items()" [address]="address()" [shipping]="shipping" />
              }
            }

            <div class="co__nav">
              @if (step() > 0) {
                <button type="button" class="btn" (click)="back()">Back</button>
              }
              @if (step() < 3) {
                <button type="button" class="btn btn--primary" (click)="next()">Continue</button>
              } @else {
                <button type="button" class="btn btn--primary" (click)="placeOrder()">Place order</button>
              }
            </div>
          </div>

          <aside class="co__summary">
            <ngbr-order-summary
              [subtotal]="store.subtotal()"
              [shipping]="shipping"
              [discount]="discount()"
              [currency]="store.currency()"
            />
          </aside>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .co {
        max-width: 980px;
        margin-inline: auto;
        padding: clamp(20px, 4vw, 40px) clamp(16px, 5vw, 32px) 64px;
      }
      .co__grid {
        display: grid;
        grid-template-columns: 1fr minmax(260px, 320px);
        gap: 28px;
        margin-top: 24px;
        align-items: start;
      }
      @media (max-width: 720px) {
        .co__grid {
          grid-template-columns: 1fr;
        }
      }
      .mt {
        margin-top: 28px;
      }
      .co__nav {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        margin-top: 28px;
      }
      .btn {
        padding: 11px 20px;
        font: inherit;
        font-weight: 600;
        color: var(--ngbr-color-text);
        background: var(--ngbr-color-surface);
        border: 1px solid var(--ngbr-color-border);
        border-radius: var(--ngbr-radius);
        cursor: pointer;
        text-decoration: none;
      }
      .btn--primary {
        margin-left: auto;
        color: var(--ngbr-color-accent-contrast, #fff);
        background: var(--ngbr-color-accent);
        border-color: transparent;
      }
      .btn:focus-visible {
        outline: 2px solid var(--ngbr-color-accent);
        outline-offset: 2px;
      }
      .fakecard {
        padding: 18px;
        text-align: center;
        color: var(--ngbr-color-text-muted);
        border: 1px dashed var(--ngbr-color-border);
        border-radius: var(--ngbr-radius);
      }
      .msg {
        margin-top: 10px;
        color: var(--ngbr-color-accent);
        font-weight: 600;
      }
      .done {
        margin-top: 24px;
      }
      .empty {
        margin-top: 16px;
      }
    `,
  ],
})
export class Checkout {
  protected readonly store = inject(NgbrCartStore);
  protected readonly steps = STEPS;
  protected readonly shipping = SHIPPING;

  protected readonly step = signal(0);
  protected readonly address = signal<NgbrAddress>({
    name: '',
    line1: '',
    line2: '',
    city: '',
    postcode: '',
    country: 'United Kingdom',
  });
  protected readonly coupon = signal('');
  protected readonly couponMsg = signal('');
  protected readonly couponRate = signal(0);
  protected readonly placed = signal(false);

  protected readonly discount = computed(() =>
    Math.round(this.store.subtotal() * this.couponRate() * 100) / 100,
  );

  protected next(): void {
    this.step.update((s) => Math.min(STEPS.length - 1, s + 1));
  }
  protected back(): void {
    this.step.update((s) => Math.max(0, s - 1));
  }

  protected applyCoupon(code: string): void {
    if (code.trim().toUpperCase() === 'SAVE10') {
      this.couponRate.set(0.1);
      this.couponMsg.set('Code applied — 10% off!');
    } else {
      this.couponRate.set(0);
      this.couponMsg.set(`"${code}" isn't a valid code. Try SAVE10.`);
    }
  }

  protected placeOrder(): void {
    this.placed.set(true);
    this.store.clear();
  }
}
