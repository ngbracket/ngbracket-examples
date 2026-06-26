import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { NgbrMonthView, NgbrWeekView, NgbrAgenda } from '@ngbracket/scheduler';
import type { NgbrCalendarEvent } from '@ngbracket/scheduler';

import { APPOINTMENTS } from '../data/booking-data';

type View = 'month' | 'week' | 'agenda';

/** The salon diary — switch between month, week and agenda views. */
@Component({
  selector: 'booking-calendar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgbrMonthView, NgbrWeekView, NgbrAgenda, TitleCasePipe],
  template: `
    <div class="head">
      <h1>Diary</h1>
      <div class="seg" role="group" aria-label="Calendar view">
        @for (v of views; track v) {
          <button
            type="button"
            [attr.aria-pressed]="view() === v"
            class="seg__btn"
            [class.is-active]="view() === v"
            (click)="view.set(v)"
          >
            {{ v | titlecase }}
          </button>
        }
      </div>
    </div>

    @if (selected(); as ev) {
      <p class="sel" role="status">Selected: <strong>{{ ev.title }}</strong> — {{ ev.start.toLocaleString() }}</p>
    }

    <div class="view">
      @switch (view()) {
        @case ('month') {
          <ngbr-month-view [events]="events" (eventClick)="selected.set($event)" />
        }
        @case ('week') {
          <ngbr-week-view [events]="events" [scrollToHour]="8" (eventClick)="selected.set($event)" />
        }
        @case ('agenda') {
          <ngbr-agenda [events]="events" (eventClick)="selected.set($event)" />
        }
      }
    </div>
  `,
  styles: [
    `
      .head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        flex-wrap: wrap;
        margin-bottom: 16px;
      }
      h1 {
        margin: 0;
      }
      .seg {
        display: inline-flex;
        padding: 3px;
        background: color-mix(in srgb, var(--ngbr-color-text-muted) 12%, transparent);
        border-radius: 10px;
      }
      .seg__btn {
        padding: 7px 14px;
        font: inherit;
        font-weight: 600;
        color: var(--ngbr-color-text-muted);
        background: none;
        border: 0;
        border-radius: 8px;
        cursor: pointer;
      }
      .seg__btn.is-active {
        color: var(--ngbr-color-text);
        background: var(--app-surface);
      }
      .seg__btn:focus-visible {
        outline: 2px solid var(--ngbr-color-accent);
        outline-offset: 2px;
      }
      .sel {
        margin: 0 0 14px;
        color: var(--ngbr-color-accent);
      }
    `,
  ],
})
export class Calendar {
  protected readonly views: View[] = ['month', 'week', 'agenda'];
  protected readonly view = signal<View>('month');
  protected readonly events = APPOINTMENTS;
  protected readonly selected = signal<NgbrCalendarEvent | null>(null);
}
