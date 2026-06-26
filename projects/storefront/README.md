# Storefront (`storefront`)

A direct-to-consumer shop built with **`@ngbracket/marketing`,
`@ngbracket/commerce`, `@ngbracket/auth` and `@ngbracket/forms`**. All data is
hardcoded in [`src/app/data/shop-data.ts`](src/app/data/shop-data.ts).

## Run

```bash
export NGBRACKET_TOKEN=ngbr_…    # once per shell (see the root README)
npm install                       # once
npm run start:storefront          # http://localhost:4302
```

## What it shows

| Route | Packs | Highlights |
| --- | --- | --- |
| `/` | marketing | `NgbrMarketingHeader`, `NgbrHero`, feature grid, stats, steps, `NgbrPricingTable`, testimonials, `NgbrFaq`, `NgbrNewsletter`, `NgbrFooter` |
| `/shop` | commerce | grid of `NgbrProductCard` |
| `/product/:id` | commerce | `NgbrProductGallery`, `NgbrRating`, `NgbrQuantityStepper`, `NgbrReviewList` + `NgbrRatingSummary` |
| cart | commerce | `NgbrCartStore` (signal store) + `NgbrCartDrawer` + `NgbrMiniCart` |
| `/checkout` | commerce · forms | `NgbrCheckoutSteps` → `NgbrAddressForm` → `NgbrCouponField` (try **SAVE10**) → `NgbrPaymentShell` → `NgbrOrderReview` |
| `/signin` | auth | `NgbrLoginForm` / `NgbrSignupForm` toggle |

The cart is a shared `NgbrCartStore` singleton; add items from the shop or a
product page and they appear in the drawer and checkout.

## Key files

- `shell/store-shell.ts` — marketing header, cart drawer, footer
- `pages/landing.ts` — the marketing homepage
- `pages/product.ts` — product detail + reviews
- `pages/checkout.ts` — the multi-step checkout
