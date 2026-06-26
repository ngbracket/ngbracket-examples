import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgbrDateRangePicker, NgbrRecurrenceEditor } from '@ngbracket/scheduler';
import type { NgbrDateRange, NgbrRecurrence } from '@ngbracket/scheduler';

/** Set recurring availability — a date range plus a recurrence rule. */
@Component({
  selector: 'booking-availability',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgbrDateRangePicker, NgbrRecurrenceEditor],
  template: `
    <h1>Availability</h1>
    <p class="muted">Block out the dates you're working and how the pattern repeats.</p>

    <div class="cards">
      <section class="card">
        <h2>Working dates</h2>
        <ngbr-date-range-picker [(value)]="range" />
        <p class="val" role="status">{{ rangeLabel() }}</p>
      </section>

      <section class="card">
        <h2>Repeats</h2>
        <ngbr-recurrence-editor [(value)]="rule" [start]="start" />
      </section>
    </div>

    <button type="button" class="btn btn--primary" (click)="save()">Save availability</button>
    @if (saved()) {
      <p class="val" role="status">Saved ✓ — {{ summary() }}</p>
    }
  `,
  styles: [
    `
      h1 {
        margin: 0 0 4px;
      }
      .muted {
        color: var(--ngbr-color-text-muted);
        margin: 0 0 22px;
      }
      .cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 18px;
        margin-bottom: 22px;
      }
      .card {
        padding: 20px;
        background: var(--app-surface);
        border: 1px solid var(--ngbr-color-border);
        border-radius: 14px;
      }
      h2 {
        margin: 0 0 14px;
        font-size: 1.05rem;
      }
      .val {
        margin-top: 12px;
        color: var(--ngbr-color-accent);
        font-weight: 600;
      }
      .btn {
        padding: 11px 20px;
        font: inherit;
        font-weight: 600;
        border-radius: var(--ngbr-radius);
        cursor: pointer;
        border: 1px solid transparent;
      }
      .btn--primary {
        color: var(--ngbr-color-accent-contrast, #fff);
        background: var(--ngbr-color-accent);
      }
      .btn:focus-visible {
        outline: 2px solid var(--ngbr-color-accent);
        outline-offset: 2px;
      }
    `,
  ],
})
export class Availability {
  protected readonly start = new Date();
  protected readonly range = signal<NgbrDateRange>({ start: null, end: null });
  protected readonly rule = signal<NgbrRecurrence | null>({ freq: 'weekly', interval: 1 });
  protected readonly saved = signal(false);

  protected readonly rangeLabel = computed(() => {
    const r = this.range();
    if (!r?.start) return 'No dates selected.';
    const end = r.end ? ` → ${r.end.toLocaleDateString()}` : '';
    return `${r.start.toLocaleDateString()}${end}`;
  });

  protected readonly summary = computed(() => {
    const rule = this.rule();
    return rule ? `repeats every ${rule.interval} ${rule.freq}` : 'one-off';
  });

  protected save(): void {
    this.saved.set(true);
  }
}
