import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { NgbrMonthView, NgbrWeekView, NgbrAgenda } from '@ngbracket/scheduler';
import type { NgbrCalendarEvent, NgbrEventDraft, NgbrEventEdit } from '@ngbracket/scheduler';

import { APPOINTMENTS } from '../data/booking-data';
import { EventEditor } from './event-editor';

type View = 'month' | 'week' | 'agenda';

/** The salon diary — switch between month, week and agenda views. */
@Component({
  selector: 'booking-calendar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgbrMonthView, NgbrWeekView, NgbrAgenda, TitleCasePipe, EventEditor],
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

    @if (view() !== 'agenda') {
      <p class="hint">
        Click an appointment to edit its details, drag it to move, drag its edge to resize, or drag
        empty time to add one. Keyboard: Tab to an appointment then arrows to move, Shift+arrows to
        resize/stretch, Enter to edit — or Tab to a day ({{ view() === 'month' ? 'the date number' : 'the “add” button' }})
        and press Enter to add a new appointment.
      </p>
    }

    @if (selected(); as ev) {
      <p class="sel" role="status">Selected: <strong>{{ ev.title }}</strong> — {{ ev.start.toLocaleString() }}</p>
    }

    <div class="view">
      @switch (view()) {
        @case ('month') {
          <ngbr-month-view
            [events]="events()"
            [editable]="true"
            (eventClick)="open($event)"
            (dayClick)="createOnDay($event)"
            (rangeCreate)="create($event)"
            (eventChange)="update($event)"
            (eventResize)="update($event)"
          />
        }
        @case ('week') {
          <ngbr-week-view
            [events]="events()"
            [editable]="true"
            [scrollToHour]="8"
            (eventClick)="open($event)"
            (rangeCreate)="create($event)"
            (eventChange)="update($event)"
            (eventResize)="update($event)"
          />
        }
        @case ('agenda') {
          <ngbr-agenda [events]="events()" (eventClick)="open($event)" />
        }
      }
    </div>

    <booking-event-editor
      [event]="editing()"
      (save)="save($event)"
      (remove)="removeEvent($event)"
      (cancel)="editing.set(null)"
    />
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
      .hint {
        margin: 0 0 12px;
        font-size: 0.875rem;
        color: var(--ngbr-color-text-muted);
      }
    `,
  ],
})
export class Calendar {
  protected readonly views: View[] = ['month', 'week', 'agenda'];
  protected readonly view = signal<View>('month');
  protected readonly events = signal<NgbrCalendarEvent[]>([...APPOINTMENTS]);
  protected readonly selected = signal<NgbrCalendarEvent | null>(null);
  /** The appointment open in the edit dialog (null = closed). */
  protected readonly editing = signal<NgbrCalendarEvent | null>(null);

  /** Click / Enter on an appointment → open the edit dialog. */
  protected open(ev: NgbrCalendarEvent): void {
    this.selected.set(ev);
    this.editing.set(ev);
  }

  /** Keyboard/day activation in month view → add a default 1-hour appointment at
   *  9am on that day, then open it to fill in details. */
  protected createOnDay(day: Date): void {
    const start = new Date(day);
    start.setHours(9, 0, 0, 0);
    const end = new Date(start);
    end.setHours(10, 0, 0, 0);
    this.create({ start, end, allDay: false });
  }

  /** Drag across empty time / days → add an appointment, then open it to fill in details. */
  protected create(draft: NgbrEventDraft): void {
    const ev: NgbrCalendarEvent = {
      id: crypto.randomUUID(),
      title: 'New appointment',
      start: draft.start,
      end: draft.end,
      allDay: draft.allDay,
      color: '#0e7490',
    };
    this.events.update((list) => [...list, ev]);
    this.selected.set(ev);
    this.editing.set(ev);
  }

  /** Drag / keyboard move or resize → write the new time back. */
  protected update(edit: NgbrEventEdit): void {
    this.events.update((list) =>
      list.map((ev) => (ev.id === edit.id ? { ...ev, start: edit.start, end: edit.end } : ev)),
    );
  }

  /** Dialog save → replace the edited appointment and close. */
  protected save(edited: NgbrCalendarEvent): void {
    this.events.update((list) => list.map((ev) => (ev.id === edited.id ? edited : ev)));
    this.selected.set(edited);
    this.editing.set(null);
  }

  /** Dialog delete → drop the appointment and close. */
  protected removeEvent(id: string): void {
    this.events.update((list) => list.filter((ev) => ev.id !== id));
    this.selected.set(null);
    this.editing.set(null);
  }
}
