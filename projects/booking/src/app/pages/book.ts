import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { form, required, email, FormField } from '@angular/forms/signals';
import { NgbrMiniCalendar, NgbrTimeSlots } from '@ngbracket/scheduler';
import type { NgbrCalendarValue } from '@ngbracket/scheduler';
import { NgbrFormField, NgbrInput } from '@ngbracket/forms';
import {
  NgbrButton,
  NgbrMenu,
  NgbrMenuOption,
  NgbrMenuPanel,
  NgbrMenuDivider,
  NgbrSplitButton,
  NgbrSplitButtonPrimary,
} from '@ngbracket/buttons';

import { SERVICES, type Service } from '../data/booking-data';

const STEP_LABELS = ['Service', 'Date', 'Time', 'Details', 'Done'];

/** Guided booking wizard: service → date → time → details → confirmation. */
@Component({
  selector: 'booking-book',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgbrMiniCalendar,
    NgbrTimeSlots,
    NgbrFormField,
    NgbrInput,
    FormField,
    NgbrButton,
    NgbrMenu,
    NgbrMenuOption,
    NgbrMenuPanel,
    NgbrMenuDivider,
    NgbrSplitButton,
    NgbrSplitButtonPrimary,
  ],
  template: `
    <h1>Book an appointment</h1>

    <ol class="steps" aria-label="Booking steps">
      @for (label of stepLabels; track label; let i = $index) {
        <li [class.is-active]="step() === i" [class.is-done]="step() > i" [attr.aria-current]="step() === i ? 'step' : null">
          <span class="steps__n">{{ i + 1 }}</span>{{ label }}
        </li>
      }
    </ol>

    <section class="panel">
      @switch (step()) {
        @case (0) {
          <h2>Choose a service</h2>
          <div class="services" role="radiogroup" aria-label="Service">
            @for (s of services; track s.id) {
              <button
                type="button"
                role="radio"
                class="service"
                [class.is-sel]="service()?.id === s.id"
                [attr.aria-checked]="service()?.id === s.id"
                (click)="service.set(s)"
              >
                <span class="service__name">{{ s.name }}</span>
                <span class="service__meta">{{ s.duration }} min · £{{ s.price }}</span>
                <span class="service__desc">{{ s.description }}</span>
              </button>
            }
          </div>
        }
        @case (1) {
          <h2>Pick a date</h2>
          <ngbr-mini-calendar [(value)]="date" />
        }
        @case (2) {
          <h2>Pick a time</h2>
          <p class="muted">Available slots for {{ dateLabel() }}.</p>
          <ngbr-time-slots from="09:00" to="17:00" [intervalMinutes]="30" [disabledSlots]="taken" [(value)]="slot" />
        }
        @case (3) {
          <h2>Your details</h2>
          <div class="fields">
            <ngbr-form-field label="Full name">
              <ngbr-input id="bk-name" [formField]="f.name" [forceShowErrors]="tried()" />
            </ngbr-form-field>
            <ngbr-form-field label="Email">
              <ngbr-input id="bk-email" type="email" [formField]="f.email" [forceShowErrors]="tried()" />
            </ngbr-form-field>
            <ngbr-form-field label="Phone" hint="So we can text a reminder.">
              <ngbr-input id="bk-phone" [formField]="f.phone" [forceShowErrors]="tried()" />
            </ngbr-form-field>
          </div>
        }
        @case (4) {
          <div class="done" role="status">
            <h2>You're booked! 🎉</h2>
            <p>
              {{ service()?.name }} on <strong>{{ dateLabel() }}</strong> at <strong>{{ slot() }}</strong>.
              A confirmation is on its way to {{ model().email }}.
            </p>
            <button type="button" class="btn btn--primary" (click)="reset()">Book another</button>
          </div>
        }
      }
    </section>

    @if (step() < 4) {
      <div class="nav">
        @if (step() > 0) {
          <button type="button" class="btn" (click)="back()">Back</button>
        }
        @if (step() < 3) {
          <button type="button" class="btn btn--primary" [disabled]="!canContinue()" (click)="next()">Continue</button>
        } @else {
          <ngbr-split-button ariaLabel="Confirm booking options" (action)="confirm()">
            <button ngbrButton ngbrSplitButtonPrimary>Confirm booking</button>
            <ng-template ngbrMenu>
              <ngbr-menu-panel ariaLabel="Confirm booking options">
                <button ngbrMenuOption (select)="confirmAndNotify()">Confirm &amp; notify</button>
                <ngbr-menu-divider />
                <button ngbrMenuOption danger (select)="cancelBooking()">Cancel booking</button>
              </ngbr-menu-panel>
            </ng-template>
          </ngbr-split-button>
        }
      </div>
    }
  `,
  styles: [
    `
      h1 {
        margin: 0 0 18px;
      }
      .steps {
        display: flex;
        flex-wrap: wrap;
        gap: 8px 18px;
        list-style: none;
        padding: 0;
        margin: 0 0 24px;
      }
      .steps li {
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--ngbr-color-text-muted);
        font-weight: 600;
      }
      .steps li.is-active {
        color: var(--ngbr-color-accent);
      }
      .steps__n {
        display: inline-grid;
        place-items: center;
        width: 24px;
        height: 24px;
        font-size: 0.8rem;
        border-radius: 50%;
        background: color-mix(in srgb, var(--ngbr-color-text-muted) 16%, transparent);
        color: var(--ngbr-color-text);
      }
      .steps li.is-active .steps__n {
        background: var(--ngbr-color-accent);
        color: var(--ngbr-color-accent-contrast, #fff);
      }
      .steps li.is-done .steps__n {
        background: color-mix(in srgb, var(--ngbr-color-accent) 30%, transparent);
      }
      .panel {
        padding: 22px;
        background: var(--app-surface);
        border: 1px solid var(--ngbr-color-border);
        border-radius: 14px;
      }
      h2 {
        margin: 0 0 14px;
      }
      .muted {
        color: var(--ngbr-color-text-muted);
        margin: 0 0 12px;
      }
      .services {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 12px;
      }
      .service {
        display: grid;
        gap: 4px;
        text-align: start;
        padding: 14px;
        background: var(--ngbr-color-surface);
        border: 1px solid var(--ngbr-color-border);
        border-radius: 12px;
        cursor: pointer;
      }
      .service.is-sel {
        border-color: var(--ngbr-color-accent);
        box-shadow: 0 0 0 1px var(--ngbr-color-accent);
      }
      .service:focus-visible {
        outline: 2px solid var(--ngbr-color-accent);
        outline-offset: 2px;
      }
      .service__name {
        font-weight: 700;
      }
      .service__meta {
        color: var(--ngbr-color-accent);
        font-weight: 600;
        font-size: 0.9rem;
      }
      .service__desc {
        color: var(--ngbr-color-text-muted);
        font-size: 0.85rem;
      }
      .fields {
        display: flex;
        flex-direction: column;
        gap: 14px;
        max-width: 420px;
      }
      .nav {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        margin-top: 20px;
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
      }
      .btn--primary {
        margin-left: auto;
        color: var(--ngbr-color-accent-contrast, #fff);
        background: var(--ngbr-color-accent);
        border-color: transparent;
      }
      .btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .btn:focus-visible {
        outline: 2px solid var(--ngbr-color-accent);
        outline-offset: 2px;
      }
    `,
  ],
})
export class Book {
  protected readonly stepLabels = STEP_LABELS;
  protected readonly services = SERVICES;
  protected readonly taken = ['10:30', '13:00', '15:30'];

  protected readonly step = signal(0);
  protected readonly service = signal<Service | null>(null);
  protected readonly date = signal<NgbrCalendarValue>(null);
  protected readonly slot = signal('');
  protected readonly tried = signal(false);

  protected readonly model = signal({ name: '', email: '', phone: '' });
  protected readonly f = form(this.model, (p) => {
    required(p.name, { message: 'Enter your name' });
    required(p.email, { message: 'Enter your email' });
    email(p.email, { message: 'Enter a valid email' });
    required(p.phone, { message: 'Enter a phone number' });
  });

  protected readonly dateLabel = computed(() => this.date()?.toLocaleDateString() ?? '—');

  protected readonly canContinue = computed(() => {
    switch (this.step()) {
      case 0:
        return this.service() !== null;
      case 1:
        return this.date() !== null;
      case 2:
        return this.slot() !== '';
      default:
        return true;
    }
  });

  protected next(): void {
    if (this.canContinue()) this.step.update((s) => s + 1);
  }
  protected back(): void {
    this.step.update((s) => Math.max(0, s - 1));
  }

  protected confirm(): void {
    this.tried.set(true);
    const ok =
      this.f.name().errors().length === 0 &&
      this.f.email().errors().length === 0 &&
      this.f.phone().errors().length === 0;
    if (ok) this.step.set(4);
  }

  /** Confirm and (demo) fire off a notification. */
  protected confirmAndNotify(): void {
    this.confirm();
    if (this.step() === 4) console.info('[booking] Notification sent to', this.model().email);
  }

  /** Abandon the in-progress booking. */
  protected cancelBooking(): void {
    console.info('[booking] Booking cancelled');
    this.reset();
  }

  protected reset(): void {
    this.service.set(null);
    this.date.set(null);
    this.slot.set('');
    this.model.set({ name: '', email: '', phone: '' });
    this.tried.set(false);
    this.step.set(0);
  }
}
