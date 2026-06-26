/* Hardcoded storefront catalogue. No API. */
import type { NgbrProduct, NgbrReview } from '@ngbracket/commerce';

/** A solid-colour placeholder image (data URI) — keeps the demo offline-friendly. */
const img = (c: string): string =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500"><rect width="500" height="500" fill="${c}"/></svg>`,
  )}`;

export interface ShopProduct extends NgbrProduct {
  blurb: string;
  gallery: string[];
}

export const PRODUCTS: ShopProduct[] = [
  {
    id: 'beanie',
    title: 'Merino Beanie',
    price: 24,
    compareAt: 32,
    currency: 'GBP',
    rating: 4.5,
    reviewCount: 128,
    image: img('#0e7490'),
    gallery: [img('#0e7490'), img('#0b5566'), img('#14809b')],
    blurb: 'Soft 100% merino wool, ribbed knit. Warm without the itch.',
  },
  {
    id: 'tote',
    title: 'Canvas Tote',
    price: 18,
    currency: 'GBP',
    rating: 4,
    reviewCount: 54,
    image: img('#7c3aed'),
    gallery: [img('#7c3aed'), img('#6d28d9')],
    blurb: 'Heavyweight 16oz cotton canvas with reinforced handles.',
  },
  {
    id: 'scarf',
    title: 'Wool Scarf',
    price: 39,
    currency: 'GBP',
    rating: 5,
    reviewCount: 21,
    image: img('#16a34a'),
    gallery: [img('#16a34a'), img('#15803d')],
    blurb: 'Lambswool, woven in a classic herringbone. Generously long.',
  },
  {
    id: 'mug',
    title: 'Stoneware Mug',
    price: 14,
    currency: 'GBP',
    rating: 4.5,
    reviewCount: 76,
    image: img('#ea580c'),
    gallery: [img('#ea580c'), img('#c2410c')],
    blurb: 'Hand-glazed 350ml stoneware. Dishwasher and microwave safe.',
  },
  {
    id: 'socks',
    title: 'Hiking Socks',
    price: 12,
    compareAt: 16,
    currency: 'GBP',
    rating: 4,
    reviewCount: 203,
    image: img('#db2777'),
    gallery: [img('#db2777'), img('#be185d')],
    blurb: 'Cushioned merino blend with arch support. Two-pair pack.',
  },
  {
    id: 'bottle',
    title: 'Insulated Bottle',
    price: 28,
    currency: 'GBP',
    rating: 4.5,
    reviewCount: 89,
    image: img('#2563eb'),
    gallery: [img('#2563eb'), img('#1d4ed8')],
    blurb: 'Double-walled steel. Keeps drinks cold 24h, hot 12h. 750ml.',
  },
];

export function productById(id: string): ShopProduct | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export const REVIEWS: NgbrReview[] = [
  { id: 'r1', author: 'Sam P.', rating: 5, title: 'Lovely and warm', body: 'Exactly as described — super soft and not itchy at all.', date: '2026-05-12', verified: true },
  { id: 'r2', author: 'Jo M.', rating: 4, body: 'Good fit; colour slightly darker than the photo but happy with it.', date: '2026-04-30', verified: true },
  { id: 'r3', author: 'Lee K.', rating: 3, body: 'Fine quality, but shipping took a little longer than expected.', date: '2026-04-02' },
];
