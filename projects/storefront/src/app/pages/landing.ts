import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  NgbrHero,
  NgbrSectionHeading,
  NgbrFeatureGrid,
  NgbrStatsBand,
  NgbrSteps,
  NgbrPricingTable,
  NgbrTestimonials,
  NgbrFaq,
  NgbrNewsletter,
} from '@ngbracket/marketing';
import type {
  NgbrFeature,
  NgbrStat,
  NgbrStep,
  NgbrPricingTier,
  NgbrTestimonial,
  NgbrFaqItem,
} from '@ngbracket/marketing';

const FEATURES: NgbrFeature[] = [
  { icon: '🧵', title: 'Made to last', description: 'Natural materials and honest construction, built to outlive trends.' },
  { icon: '🚚', title: 'Free UK delivery', description: 'On every order over £40, dispatched within one working day.' },
  { icon: '↩️', title: '30-day returns', description: 'Changed your mind? Send it back, no questions asked.' },
];

const STATS: NgbrStat[] = [
  { value: '40k+', label: 'Happy customers' },
  { value: '4.8★', label: 'Average rating', sublabel: 'across 6,200 reviews' },
  { value: '100%', label: 'Carbon-neutral shipping' },
];

const STEPS: NgbrStep[] = [
  { title: 'Browse', description: 'Explore our small, considered range.' },
  { title: 'Order', description: 'Checkout in under a minute.' },
  { title: 'Enjoy', description: 'Delivered carbon-neutral to your door.' },
];

const TIERS: NgbrPricingTier[] = [
  { id: 'std', name: 'Standard', price: 'Free', cadence: '', blurb: 'Pay as you go.', features: ['Free delivery over £40', '30-day returns'], ctaLabel: 'Shop now' },
  { id: 'plus', name: 'Aurora+', price: '£5', priceAnnual: '£48', cadence: '/mo', blurb: 'For regulars.', features: ['Free delivery, always', '60-day returns', 'Early access to drops'], ctaLabel: 'Join Aurora+', featured: true },
];

const TESTIMONIALS: NgbrTestimonial[] = [
  { quote: 'The beanie is the softest thing I own. Worth every penny.', author: 'Sam P.', role: 'Verified buyer', rating: 5 },
  { quote: 'Fast delivery and beautiful packaging. Will definitely reorder.', author: 'Jo M.', role: 'Verified buyer', rating: 5 },
  { quote: 'Lovely quality and the returns process was painless.', author: 'Lee K.', role: 'Verified buyer', rating: 4 },
];

const FAQS: NgbrFaqItem[] = [
  { question: 'How long does delivery take?', answer: 'UK orders arrive in 2–3 working days. We dispatch within one working day.' },
  { question: 'What is your returns policy?', answer: '30 days, no questions asked. Aurora+ members get 60 days.' },
  { question: 'Are your materials sustainable?', answer: 'We use natural and recycled materials wherever possible, and ship carbon-neutral.' },
];

/** The marketing homepage — hero, features, pricing, testimonials, FAQ, newsletter. */
@Component({
  selector: 'store-landing',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    NgbrHero,
    NgbrSectionHeading,
    NgbrFeatureGrid,
    NgbrStatsBand,
    NgbrSteps,
    NgbrPricingTable,
    NgbrTestimonials,
    NgbrFaq,
    NgbrNewsletter,
  ],
  template: `
    <ngbr-hero eyebrow="New season" [split]="true">
      <h1>Everyday things, beautifully made</h1>
      <p ngbrHeroSub>A small, considered range of goods built to last — and to feel good owning.</p>
      <div ngbrHeroCta class="hero-cta">
        <a class="btn btn--primary" routerLink="/shop">Shop the range</a>
        <a class="btn" href="#pricing">See Aurora+</a>
      </div>
      <div ngbrHeroMedia class="hero-media"></div>
    </ngbr-hero>

    <section class="section">
      <ngbr-feature-grid [features]="features" [columns]="3" />
    </section>

    <section class="section section--tint">
      <ngbr-stats-band [stats]="stats" />
    </section>

    <section class="section">
      <ngbr-section-heading eyebrow="How it works" title="Simple from cart to doorstep" [level]="2" />
      <ngbr-steps [steps]="steps" />
    </section>

    <section id="pricing" class="section section--tint">
      <ngbr-section-heading eyebrow="Membership" title="Join Aurora+" subtitle="Free delivery and longer returns for regulars." [level]="2" />
      <ngbr-pricing-table [tiers]="tiers" [(period)]="period" (select)="onPlan($event.name)" />
      @if (planMsg()) {
        <p class="msg" role="status">{{ planMsg() }}</p>
      }
    </section>

    <section id="reviews" class="section">
      <ngbr-section-heading eyebrow="Reviews" title="Loved by 40,000 customers" [level]="2" />
      <ngbr-testimonials [items]="testimonials" />
    </section>

    <section id="faq" class="section section--tint">
      <ngbr-section-heading eyebrow="FAQ" title="Good to know" [level]="2" />
      <ngbr-faq [items]="faqs" />
    </section>

    <section class="section newsletter">
      <ngbr-section-heading eyebrow="Stay in touch" title="Get 10% off your first order" subtitle="Join the newsletter — no spam, unsubscribe any time." [level]="2" />
      @if (subscribed()) {
        <p class="msg" role="status">Thanks! Check your inbox for the code.</p>
      } @else {
        <ngbr-newsletter [(value)]="email" ctaLabel="Subscribe" (submitEmail)="subscribed.set(true)" />
      }
    </section>
  `,
  styles: [
    `
      .section {
        padding: clamp(40px, 7vw, 80px) clamp(16px, 5vw, 32px);
        max-width: 1120px;
        margin-inline: auto;
      }
      .section--tint {
        max-width: none;
        background: color-mix(in srgb, var(--ngbr-color-accent) 6%, var(--app-bg));
      }
      .section--tint > * {
        max-width: 1120px;
        margin-inline: auto;
      }
      .hero-cta {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
      }
      .hero-media {
        aspect-ratio: 4 / 3;
        border-radius: 14px;
        background: linear-gradient(135deg, var(--ngbr-color-accent), #7c3aed);
      }
      .btn {
        display: inline-flex;
        align-items: center;
        padding: 11px 20px;
        font-weight: 600;
        text-decoration: none;
        color: var(--ngbr-color-text);
        background: var(--ngbr-color-surface);
        border: 1px solid var(--ngbr-color-border);
        border-radius: var(--ngbr-radius);
      }
      .btn--primary {
        color: var(--ngbr-color-accent-contrast, #fff);
        background: var(--ngbr-color-accent);
        border-color: transparent;
      }
      .btn:focus-visible {
        outline: 2px solid var(--ngbr-color-accent);
        outline-offset: 2px;
      }
      .msg {
        margin-top: 14px;
        color: var(--ngbr-color-accent);
        font-weight: 600;
      }
      .newsletter {
        text-align: center;
      }
      .newsletter ngbr-newsletter {
        display: inline-block;
        margin-top: 8px;
        text-align: start;
      }
    `,
  ],
})
export class Landing {
  protected readonly features = FEATURES;
  protected readonly stats = STATS;
  protected readonly steps = STEPS;
  protected readonly tiers = TIERS;
  protected readonly testimonials = TESTIMONIALS;
  protected readonly faqs = FAQS;

  protected readonly period = signal<'monthly' | 'annual'>('monthly');
  protected readonly email = signal('');
  protected readonly subscribed = signal(false);
  protected readonly planMsg = signal('');

  protected onPlan(name: string): void {
    this.planMsg.set(`You chose ${name}. (Demo — no checkout wired for membership.)`);
  }
}
